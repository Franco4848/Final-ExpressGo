import api from "./api";

export const getDriverRoute = (driverId: string) =>
  api.get(`/drivers/${driverId}/route`);
