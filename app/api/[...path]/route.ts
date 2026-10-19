import { diningAPI } from "../../../lib/dining-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return diningAPI(request, {
    OPENWEBNINJA_API_KEY: process.env.OPENWEBNINJA_API_KEY,
    GEOAPIFY_API_KEY: process.env.GEOAPIFY_API_KEY,
  });
}
