import api from "./api";
import type { CreateDriverDto } from "../types/driver";

export const getDrivers = () => api.get("/drivers");

export const createDriver = (data: CreateDriverDto) =>
  api.post("/drivers", data);

export const deleteDriver = (id: string) => 
    api.delete(`/drivers/${id}`);

export const updateDriver = (id:string, data: CreateDriverDto)=>
    api.patch(`/drivers/${id}`, data);