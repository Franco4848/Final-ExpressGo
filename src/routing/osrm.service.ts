import axios from "axios";
import { Injectable } from "@nestjs/common";

type LatLng = { lat: number; lng: number };

@Injectable()
export class OsrmService {
  private baseUrl = "https://router.project-osrm.org";

  async getRoute(points: LatLng[]) {
    if (points.length < 2) {
      return {
        distanceMeters: 0,
        durationSeconds: 0,
        geometry: points.map((p) => [p.lat, p.lng] as [number, number]),
      };
    }

    const coords = points.map((p) => `${p.lng},${p.lat}`).join(";");
    const url = `${this.baseUrl}/route/v1/driving/${coords}`;

    const res = await axios.get(url, {
      params: { overview: "full", geometries: "geojson" },
    });

    const route = res.data.routes?.[0];
    if (!route) {
      return { distanceMeters: 0, durationSeconds: 0, geometry: [] as [number, number][] };
    }

    const geometry = route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
    );

    return {
      distanceMeters: route.distance,
      durationSeconds: route.duration,
      geometry,
    };
  }
}
