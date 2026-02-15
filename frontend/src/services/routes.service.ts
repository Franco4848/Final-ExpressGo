import api from "./api";

export const getDriverRoute = (driverId: string) =>
  api.get(`/drivers/${driverId}/route`);

export const reorderDriverRoute = (driverId: string, orderedPackageIds: string[]) =>
  api.patch(`/drivers/${driverId}/route/reorder`, { orderedPackageIds });
