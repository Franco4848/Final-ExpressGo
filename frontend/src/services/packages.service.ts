import api from "./api";
import type { CreatePackageDto } from "../types/package";

export const getPackages = () => api.get("/packages");

export const createPackage = (data: CreatePackageDto) =>
  api.post("/packages", data);

export const updatePackage = (id: string, data: CreatePackageDto) =>
  api.patch(`/packages/${id}`, data);

export const deletePackage = (id: string) =>
  api.delete(`/packages/${id}`);
