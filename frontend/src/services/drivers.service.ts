import api from "./api";
import type { CreateDriverDto } from "../types/driver";

export const getDrivers = () => api.get("/drivers");

export const createDriver = (data: CreateDriverDto) =>
  api.post("/drivers", data);
