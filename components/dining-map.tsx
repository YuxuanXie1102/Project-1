'use client';
import {useEffect,useRef,useState} from 'react';
import type {LayerGroup,Map} from 'leaflet';
import type {Restaurant} from '../lib/dining';

type Props={
  center:{lat:number;lon:number;label?:string};
  restaurants:Restaurant[];
  selected:string|null;
  route:{minutes:number;km:number;mode:string;points:[number,number][]}|null;
  travelMode:string;
  onSelect:(restaurant:Restaurant)=>void;
  onDetails:(restaurant:Restaurant)=>void;
};

type Point={x:number;y:number};
type Gesture={start:[Point,Point];previous:[Point,Point];centroid:Point;distance:number;zoom:number;mode:'pending'|'pan'|'zoom'};
const centroid=(touches:TouchList)=>({x:(touches[0].clientX+touches[1].clientX)/2,y:(touches[0].clientY+touches[1].clientY)/2});
const distance=(touches:TouchList)=>Math.hypot(touches[1].clientX-touches[0].clientX,touches[1].clientY-touches[0].clientY);
const points=(touches:TouchList):[Point,Point]=>[{x:touches[0].clientX,y:touches[0].clientY},{x:touches[1].clientX,y:touches[1].clientY}];

export default function DiningMap({center,restaurants,selected,route,travelMode,onSelect,onDetails}:Props){
  const host=useRef<HTMLDivElement>(null);
  const map=useRef<Map|null>(null);
  const layers=useRef<LayerGroup|null>(null);
  const routeLayers=useRef<LayerGroup|null>(null);
  const select=useRef(onSelect);
  const details=useRef(onDetails);
  const gesture=useRef<Gesture|null>(null);
  const [mounted,setMounted]=useState(false);
  const [failed,setFailed]=useState(false);
  select.current=onSelect;
  details.current=onDetails;

  useEffect(()=>{
    let disposed=false;
    let observer:ResizeObserver;
    let cleanupGesture=()=>{};
    import('leaflet').then(L=>{
      if(disposed||!host.current)return;
      const touchDevice=matchMedia('(pointer: coarse)').matches;
      const m=L.map(host.current,{scrollWheelZoom:false,zoomControl:true,dragging:!touchDevice,touchZoom:false,doubleClickZoom:!touchDevice}).setView([center.lat,center.lon],14);
      map.current=m;
      let errors=0;
      L.tileLayer('/api/tile/{z}/{x}/{y}?scale='+(L.Browser.retina?'2':'1'),{maxZoom:20,attribution:'© <a href="https://www.geoapify.com/">Geoapify</a> · © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).on('tileerror',()=>{if(++errors>4)setFailed(true)}).on('tileload',()=>setFailed(false)).addTo(m);
      layers.current=L.layerGroup().addTo(m);
      routeLayers.current=L.layerGroup().addTo(m);
      observer=new ResizeObserver(()=>m.invalidateSize());
      observer.observe(host.current);

      if(touchDevice){
        const element=host.current;
        const start=(event:TouchEvent)=>{
          if(event.touches.length!==2){gesture.current=null;return;}
          event.preventDefault();
          const initial=points(event.touches);
          gesture.current={start:initial,previous:initial,centroid:centroid(event.touches),distance:distance(event.touches),zoom:m.getZoom(),mode:'pending'};
        };
        const move=(event:TouchEvent)=>{
          if(event.touches.length!==2||!gesture.current)return;
          event.preventDefault();
          const nextCentroid=centroid(event.touches);
          const nextDistance=distance(event.touches);
          const nextPoints=points(event.touches);
          const state=gesture.current;
          if(state.mode==='pending'){
            const v1={x:nextPoints[0].x-state.start[0].x,y:nextPoints[0].y-state.start[0].y};
            const v2={x:nextPoints[1].x-state.start[1].x,y:nextPoints[1].y-state.start[1].y};
            const len1=Math.hypot(v1.x,v1.y),len2=Math.hypot(v2.x,v2.y);
            const centroidTravel=Math.hypot(nextCentroid.x-state.centroid.x,nextCentroid.y-state.centroid.y);
            const separationChange=Math.abs(nextDistance-state.distance);
            const directionAgreement=len1>2&&len2>2?(v1.x*v2.x+v1.y*v2.y)/(len1*len2):0;
            // Parallel finger vectors are a pan even if the hand spacing wobbles.
            // Opposing vectors or a dominant separation change are a pinch.
            if(centroidTravel>5&&directionAgreement>.45)state.mode='pan';
            else if(separationChange>5&&(directionAgreement<.15||separationChange>centroidTravel*1.35))state.mode='zoom';
            else if(centroidTravel>8&&centroidTravel>separationChange*1.25)state.mode='pan';
          }
          if(state.mode==='zoom'){
            const point=m.containerPointToLatLng(m.mouseEventToContainerPoint({clientX:nextCentroid.x,clientY:nextCentroid.y} as MouseEvent));
            const target=Math.max(m.getMinZoom(),Math.min(m.getMaxZoom(),state.zoom+Math.log2(nextDistance/state.distance)));
            m.setZoomAround(point,target,{animate:false});
          }else if(state.mode==='pan'){
            m.panBy([state.centroid.x-nextCentroid.x,state.centroid.y-nextCentroid.y],{animate:false});
          }
          state.previous=nextPoints;
          if(state.mode==='pan')state.centroid=nextCentroid;
        };
        const end=(event:TouchEvent)=>{if(event.touches.length<2)gesture.current=null};
        element.addEventListener('touchstart',start,{passive:false});
        element.addEventListener('touchmove',move,{passive:false});
        element.addEventListener('touchend',end,{passive:true});
        element.addEventListener('touchcancel',end,{passive:true});
        cleanupGesture=()=>{element.removeEventListener('touchstart',start);element.removeEventListener('touchmove',move);element.removeEventListener('touchend',end);element.removeEventListener('touchcancel',end)};
      }else{
        const element=host.current;
        let safariStartZoom=m.getZoom();
        const wheel=(event:WheelEvent)=>{
          event.preventDefault();
          if(event.ctrlKey){
            // macOS exposes trackpad pinch as a ctrl-modified wheel gesture.
            const point=m.mouseEventToContainerPoint(event as unknown as MouseEvent);
            const target=Math.max(m.getMinZoom(),Math.min(m.getMaxZoom(),m.getZoom()-event.deltaY*.012));
            m.setZoomAround(point,target,{animate:false});
          }else{
            // Two-finger parallel scrolling produces ordinary wheel deltas.
            const factor=event.deltaMode===1?18:event.deltaMode===2?120:1;
            m.panBy([event.deltaX*factor,event.deltaY*factor],{animate:false});
          }
        };
        const gestureStart=(event:Event)=>{event.preventDefault();safariStartZoom=m.getZoom()};
        const gestureChange=(event:Event)=>{
          event.preventDefault();
          const scale=Number((event as Event&{scale?:number}).scale)||1;
          const clientX=Number((event as Event&{clientX?:number}).clientX)||element.getBoundingClientRect().left+element.clientWidth/2;
          const clientY=Number((event as Event&{clientY?:number}).clientY)||element.getBoundingClientRect().top+element.clientHeight/2;
          const point=m.mouseEventToContainerPoint({clientX,clientY} as MouseEvent);
          const target=Math.max(m.getMinZoom(),Math.min(m.getMaxZoom(),safariStartZoom+Math.log2(scale)));
          m.setZoomAround(point,target,{animate:false});
        };
        element.addEventListener('wheel',wheel,{passive:false});
        element.addEventListener('gesturestart',gestureStart,{passive:false});
        element.addEventListener('gesturechange',gestureChange,{passive:false});
        cleanupGesture=()=>{element.removeEventListener('wheel',wheel);element.removeEventListener('gesturestart',gestureStart);element.removeEventListener('gesturechange',gestureChange)};
      }
      setMounted(true);
    }).catch(()=>setFailed(true));
    return()=>{disposed=true;cleanupGesture();observer?.disconnect();map.current?.remove();map.current=null;layers.current=null;routeLayers.current=null};
  },[]);

  const signature=restaurants.map(r=>r.id+':'+r.lat+','+r.lon).join('|');
  useEffect(()=>{
    if(!mounted||!map.current)return;
    import('leaflet').then(L=>{
      if(!map.current||!layers.current)return;
      layers.current.clearLayers();
      L.circleMarker([center.lat,center.lon],{radius:7,color:'#213b3b',fillColor:'#f9e69b',fillOpacity:1,weight:3}).bindTooltip(center.label||'Starting point').addTo(layers.current);
      const points:L.LatLngExpression[]=[];
      restaurants.forEach((r,i)=>{
        if(r.lat==null||r.lon==null)return;
        points.push([r.lat,r.lon]);
        const node=document.createElement('div');node.className='photo-pin '+(selected===r.id?'pin-selected':'');
        const ring=document.createElement('span');ring.className='pin-ring';
        if(r.photo){const img=document.createElement('img');img.src=r.photo;img.alt='';img.onerror=()=>{img.remove();ring.textContent=String(i+1)};ring.appendChild(img)}else ring.textContent=String(i+1);
        node.appendChild(ring);
        const marker=L.marker([r.lat,r.lon],{title:r.name,alt:r.name,icon:L.divIcon({className:'restaurant-marker',html:node,iconSize:[52,62],iconAnchor:[26,60],popupAnchor:[0,-57]})});
        const popup=document.createElement('div');popup.className='map-popup-card';
        if(r.photo){const img=document.createElement('img');img.src=r.photo;img.alt=r.name;popup.appendChild(img)}
        const title=document.createElement('strong');title.textContent=r.name;popup.appendChild(title);
        const meta=document.createElement('p');meta.textContent=`${r.rating??'No rating'} ★ · ${r.price||'Price unavailable'}`;popup.appendChild(meta);
        if(r.route){const travel=document.createElement('p');travel.textContent=`${r.route.mode==='walk'?'Walk':r.route.mode==='bicycle'?'Cycle':'Drive'} · ${r.route.minutes} min · ${r.route.km.toFixed(1)} km`;popup.appendChild(travel)}
        const button=document.createElement('button');button.textContent='View details';button.className='primary';button.onclick=()=>details.current(r);popup.appendChild(button);
        marker.bindPopup(popup).on('click',()=>select.current(r)).addTo(layers.current!);
      });
      if(points.length){const bounds=L.latLngBounds([...points,[center.lat,center.lon]]);map.current.fitBounds(bounds,{padding:[45,45],maxZoom:15})}else map.current.setView([center.lat,center.lon],14);
    });
  },[mounted,signature,center.lat,center.lon]);

  useEffect(()=>{if(!mounted||!selected)return;layers.current?.eachLayer((layer:any)=>{const r=restaurants.find(r=>r.name===layer.options?.title);if(r?.id===selected){layer.openPopup();map.current?.panTo(layer.getLatLng());layer.getElement()?.querySelector('.photo-pin')?.classList.add('pin-selected')}else layer.getElement()?.querySelector('.photo-pin')?.classList.remove('pin-selected')})},[mounted,selected]);

  useEffect(()=>{
    if(!mounted||!map.current||!routeLayers.current)return;
    routeLayers.current.clearLayers();
    if(!route?.points?.length)return;
    import('leaflet').then(L=>{
      if(!map.current||!routeLayers.current||!route?.points?.length)return;
      const line=L.polyline(route.points,{color:'#173f3e',weight:6,opacity:.9,lineCap:'round',lineJoin:'round'}).addTo(routeLayers.current);
      const midpoint=route.points[Math.floor(route.points.length/2)];
      const symbol=travelMode==='walk'?'👣':travelMode==='bicycle'?'🚲':'🚗';
      L.marker(midpoint,{interactive:false,icon:L.divIcon({className:'route-mode-marker',html:`<span>${symbol}</span>`,iconSize:[38,38],iconAnchor:[19,19]})}).addTo(routeLayers.current);
      line.bindTooltip(`${travelMode==='walk'?'Walking':travelMode==='bicycle'?'Cycling':'Driving'} · ${route.minutes} min · ${route.km.toFixed(1)} km`,{sticky:true});
      map.current.fitBounds(line.getBounds(),{padding:[55,55],maxZoom:16,animate:true});
    });
  },[mounted,selected,route,travelMode]);

  return <div className="interactive-map"><div ref={host} className="leaflet-host" aria-label="Interactive restaurant map. Use two fingers together to move the map and pinch to zoom."/><div className="map-gesture-hint">Two fingers to move · Pinch to zoom</div>{failed&&<div className="map-error" role="status">Map tiles could not load. Check the Geoapify connection.</div>}</div>;
}
