# BiteClub — Iteration history

Owner: Yuxuan Xie. Course: DESN31927. Code: generated with ChatGPT/Codex.
Each revision remains in the Site's saved version history and Git history. The source ZIP includes this record. Dates use Toronto time.

## V1 — 2026-10-08, approximately 03:36
Source: f4e71cfa4fa72468be34d1eb9d19f925caa9513c
Site version: appgprj_6ac7459372f88191b0be0f52b7e0a74b~appgver_437330e039348191b1a0d39caad84077
Initial group preferences and budgets, restaurant search, local shortlist, shortlist-only Quick Pick and 4/8-place Battle. Fixed left navigation, inline single-cuisine filters, static map, manual routing.
Validation: type checking, build, mocked quota guard checks. No live restaurant request.

## V1 configuration update — 2026-10-08, approximately 12:37
The user supplied both API keys in Site settings. Correct names were verified, values changed to Secrets, and the same saved source version was redeployed. No key values are recorded here. No claim of live API authentication testing.

## V2 — 2026-10-08, approximately 13:02
Source: 6502a8b2d2c2ecb0957f1b936b4298f8ee83291d
Site version: appgprj_6ac7459372f88191b0be0f52b7e0a74b~appgver_aedafef97de081919f268bd4a0759e1d
User feedback: popups were misplaced; navigation used too much width; travel information required extra clicks; static map looked blurry and could not pan; location labels were too broad; price symbols were unclear.
Changes: centered dialogs, hidden navigation drawer, automatic selected-mode travel times in cards and all three modes in details, precise GPS coordinates with reverse-geocoded street/postcode, price estimates in CAD, side-by-side card/map layout, Leaflet tile map with high-resolution imagery and photo markers linked to cards.
Design rationale: reduce extra steps and reclaim horizontal space while preserving local restaurant quota controls.
Validation: TypeScript and build passed; quota checks used mocks. Browser visual and live map interaction verification not performed. No live restaurant request.

## V3 — 2026-10-08, after 13:35
User feedback: cuisine needed multiple selections; inline controls caused visual fatigue; location should show named places such as a college plus city/province; empty map columns looked broken.
Changes: multi-select cuisine chips in a centered filter modal, draft filters with Cancel/Apply, compact applied-filter summary, one confirmed restaurant query with up to five total results, separate place/street and city/province display, reverse geocoding plus nearby named-place lookup when a name is absent, default Oakville map with Filters not set placeholder before a restaurant search. Previously granted device-location permission can recenter the map; otherwise the user chooses Use my location.
Design rationale: keep the main screen focused, provide informative empty states, preserve query origin coordinates, and avoid inventing a place name. Nearby POIs may be labelled Near; data availability and device accuracy limit exact building recognition.
Validation: TypeScript and existing mocked quota checks passed. Build is performed before publishing. No live restaurant query during revision.

## Evidence for the process presentation
These entries reconstruct earlier revisions from retained source/deployment history and conversation records; they are not screenshots or usability-test findings. Compare each saved version or Git commit for before/after source. Capture real screenshots and annotate user feedback for the final PPT. Do not claim browser or live-data checks that have not been performed.

## V4 — 2026-10-08, after 14:14
Source: 8d6895ba3b1cd189489d1421d42fc6b1197983ac
Site version: appgprj_6ac7459372f88191b0be0f52b7e0a74b~appgver_12b2f6e42c0481918e22cbcd6b6b9815
User feedback: touch gestures did not match the desired mobile map behavior; location and travel labels implied the wrong meaning; decorative page copy pushed the map below the first view.
Changes: coarse-pointer devices now reserve single-finger vertical gestures for page scrolling. Two-finger parallel movement pans the map, while two-finger distance change performs pinch zoom. Desktop mouse drag and wheel zoom remain enabled. “Where are we eating?” became “Where are we?” and “Travel time” became “Travel duration.” Page eyebrow copy, decorative subtitles and large section numbers were removed; compact functional titles remain.
Design rationale: prevent accidental map movement, express that the location is the search origin rather than the restaurant address, and move important working controls and the map higher in the viewport.
Validation: TypeScript and existing mocked restaurant quota checks passed; production build runs before publishing. No live restaurant request was made. Touch behavior is implemented from native touch events and requires a real touch device for final usability verification.

## V5 — 2026-10-08, after 14:23
Source: 69fb558bea9487ee897df4c3ed42c8c1e96a3a35
Site version: appgprj_6ac7459372f88191b0be0f52b7e0a74b~appgver_be940f0d77748191827346c2d9376a9c
User feedback: the V4 page title became too tight, while the large yellow search block should remain useful before a search but stop consuming vertical space after results appear. The filter editor should expand in place rather than open as a modal.
Changes: restored a small amount of space above each functional title and added one concise subtitle per page. The yellow search and filter block now starts expanded, supports multi-cuisine and all other filters directly in the page, and automatically collapses only after a successful restaurant search. A matching yellow Edit filters button stays at the upper right of the results toolbar; it reopens the same section inline. Applied filters remain visible as compact summary chips while collapsed.
Design rationale: preserve hierarchy and breathing room without pushing the map and restaurant results below the first useful viewport. Reusing the yellow color and expanding the original block helps users connect the compact button with the full search controls.
Validation: TypeScript passed. Production build and existing mocked quota checks run before publishing. No live restaurant request is used for validation.

## V6 — 2026-10-08, after 14:39
Source: c808bbefc8de66fabd3a378e65e9af4c1dd9c66d
Site version: appgprj_6ac7459372f88191b0be0f52b7e0a74b~appgver_394c330437788191a5833bee49d6ca11
User feedback: restaurant phone information needed a matching icon; four desktop filter variables should fit on one row; Restaurant Battle needed more photos, useful comparison evidence, a better use of the winner screen, and a celebratory response.
Changes: added a phone icon and callable phone link in restaurant details. Desktop price, rating, travel mode and duration controls now share one row. Battle selection cards use restaurant photos instead of repetitive cutlery icons. Head-to-head cards show evidence-based advantages derived from existing restaurant price/rating/type data and the group’s recorded cuisine votes and shared budget. The winner view is now a two-column restaurant card and celebration panel, with a lightweight confetti animation.
Design rationale: improve visual recognition and make battle choices easier to justify without inventing facts. Advantage copy only appears when supported by saved group or restaurant data; a rating fallback is used when no comparative advantage can be established.
Validation planned: TypeScript, production build and existing mocked restaurant quota checks. No live restaurant request during validation.

## V8 — 2026-10-08, after 16:26
Source: 3edb620cf83136c3e743b835416f2731a9cf8fe1
Site version: appgprj_6ac7459372f88191b0be0f52b7e0a74b~appgver_52b8ade1ea0881919a14edfce308aef9
User feedback: two-finger parallel movement was still being interpreted as zoom, while the intended behavior is pinch to zoom and same-direction two-finger movement to pan.
Changes: replaced the distance-first gesture classifier with vector-based intent detection. The map now compares the direction of both fingers from gesture start: sufficiently parallel motion locks to pan, while opposing motion or a dominant change in finger separation locks to pinch zoom. Intent remains locked until the fingers lift, preventing small spacing variations during a pan from switching the map into zoom.
Design rationale: hand spacing naturally wobbles during two-finger translation, so distance change alone cannot reliably distinguish the two gestures. Direction agreement is the stronger signal for parallel movement.
Validation planned: TypeScript and production build. Final gesture feel requires verification on a physical multi-touch device. No live restaurant request during validation.

## V9 — 2026-10-08, after 16:32
Source: 5c5e8a7ef376bdfd1f99e69f05a481faf78c78a6
Site version: appgprj_6ac7459372f88191b0be0f52b7e0a74b~appgver_2164ff5ef7948191a327d6175aef552d
User clarification: the remaining gesture problem occurs on a MacBook trackpad, not on a touch-screen device. Parallel two-finger trackpad movement was still reaching Leaflet’s default wheel-to-zoom behavior.
Changes: disabled Leaflet’s default scroll-wheel zoom on desktop and added a trackpad-specific wheel handler. Ordinary two-axis wheel deltas now pan the map; macOS pinch gestures, exposed by Chromium as control-modified wheel events, zoom around the cursor. Safari gesture events receive the same pinch-zoom behavior. Mouse dragging and the visible zoom buttons remain available.
Design rationale: browser trackpads emit wheel/gesture events rather than touch events, so mobile touch classification cannot affect MacBook behavior. Separating ordinary wheel motion from pinch-specific signals implements the requested desktop interaction directly.
Validation planned: TypeScript and production build. Final trackpad feel requires verification on a physical MacBook. No live restaurant request during validation.

## V10 — 2026-10-08, after 16:40
Source: 96598cb1fed70dedb2a729920220da1c4fff2e86
Site version: appgprj_6ac7459372f88191b0be0f52b7e0a74b~appgver_033a3bdd25288191a549129336c3f572
User decision: restaurant review text remains out of scope to protect limited credits. The map should instead make travel more tangible by showing the selected route from the group’s starting point to a chosen restaurant.
Changes: Geoapify route responses now preserve their route geometry in addition to duration, distance and directions. Selecting or hovering a restaurant in Map mode draws the current walking, cycling or driving route as a dark rounded line. A central footsteps, bicycle or car marker identifies the travel mode, and hovering the route shows its duration and distance. Changing the travel mode uses the corresponding route already requested for the result cards.
Design rationale: connect the numeric distance to a visible journey without consuming OpenWeb Ninja restaurant credits. Only the selected restaurant route is drawn at once to avoid map clutter.
Validation planned: TypeScript, production build and mocked restaurant quota checks. No live restaurant request during validation.

## V7 — 2026-10-08, after 14:50
Source: 6e7c2263d1f1c1bc4a364739eed4452333c58557
Site version: appgprj_6ac7459372f88191b0be0f52b7e0a74b~appgver_72c14bc608bc8191969e548070f515bc
User feedback: search lacked a distance filter; the Quick Pick result card blended into its surrounding panel; Battle selection checkboxes lacked contrast; and restaurant photos should meet card edges without a visible gap.
Changes: added route-distance filtering with Any distance, Within 1 km, Within 5 km and a numeric Custom distance in kilometres. The chosen distance uses the currently selected walking, cycling or driving route distance already returned by Geoapify. Quick Pick result cards now have a warm light surface and subtle separation. Battle checkboxes are white when inactive and green with a white check when selected. Battle selection photos now run flush to the top and side edges; shared restaurant images explicitly render edge-to-edge.
Design rationale: make location constraints explicit without adding an imprecise range slider, improve selection visibility, and strengthen card/image hierarchy. Distance filtering waits for route data and does not trigger another restaurant API request.
Validation planned: TypeScript, production build and existing mocked restaurant quota checks. No live restaurant request during validation.
# Iteration 11 — Responsive mobile flow and explicit API states

Changes: strengthened the phone layout across group setup, filters, restaurant results, map mode, details and battle; added a centered API-connection error dialog that confirms no restaurant request was sent; added an inline no-suitable-restaurants state after completed searches; removed Test Version language and all bilingual confirmation labels; rewrote the quota confirmation in English to explain the limited free allowance and the five-result cap.

Validation planned: TypeScript, production build, English-only copy scan and mocked quota checks. No live restaurant request during validation.
