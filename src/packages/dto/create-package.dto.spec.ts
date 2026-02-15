import { validate } from "class-validator";
import { CreatePackageDto } from "./create-package.dto";

describe("CreatePackageDto", () => {
  it("should fail when lat/lng are out of range", async () => {
    const dto = new CreatePackageDto();
    dto.trackingId = "T-001";
    dto.address = "Calle falsa 123";
    dto.recipientName = "Juan Perez";
    dto.size = "Chico";
    dto.status = "PENDIENTE";
    dto.lat = 200;   // inválido
    dto.lng = -999;  // inválido

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);

    const latError = errors.find((e) => e.property === "lat");
    const lngError = errors.find((e) => e.property === "lng");

    expect(latError).toBeDefined();
    expect(lngError).toBeDefined();
  });
});
