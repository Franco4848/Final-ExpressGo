import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("Driver Route (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create driver -> create packages -> get route and verify order", async () => {
    // 1) Crear driver
    const driverRes = await request(app.getHttpServer())
      .post("/drivers")
      .send({
        name: "Driver Test",
        email: `test_${Date.now()}@mail.com`,
        vehicle: "Moto",
        phone: "123",
      })
      .expect(201);

    const driverId = driverRes.body.id;
    expect(driverId).toBeDefined();

    // 2) Crear 3 packages con deliveryOrder 1,2,3
    const basePkg = {
      address: "Calle 1",
      recipientName: "Dest",
      size: "Chico",
      status: "PENDIENTE",
      driverId,
    };

    const p1 = await request(app.getHttpServer())
      .post("/packages")
      .send({
        ...basePkg,
        trackingId: `PKG-1-${Date.now()}`,
        lat: -32.8895,
        lng: -68.8458,
        deliveryOrder: 1,
      })
      .expect(201);

    const p2 = await request(app.getHttpServer())
      .post("/packages")
      .send({
        ...basePkg,
        trackingId: `PKG-2-${Date.now()}`,
        lat: -32.8902,
        lng: -68.8465,
        deliveryOrder: 2,
      })
      .expect(201);

    const p3 = await request(app.getHttpServer())
      .post("/packages")
      .send({
        ...basePkg,
        trackingId: `PKG-3-${Date.now()}`,
        lat: -32.8910,
        lng: -68.8472,
        deliveryOrder: 3,
      })
      .expect(201);

    // 3) Get route
    const routeRes = await request(app.getHttpServer())
      .get(`/drivers/${driverId}/route`)
      .expect(200);

    expect(Array.isArray(routeRes.body.stops)).toBe(true);
    expect(routeRes.body.stops.length).toBeGreaterThanOrEqual(3);

    // 4) Verificar orden por deliveryOrder
    const stops = routeRes.body.stops;
    const ids = stops.map((s: any) => s.id);

    expect(ids[0]).toBe(p1.body.id);
    expect(ids[1]).toBe(p2.body.id);
    expect(ids[2]).toBe(p3.body.id);

    // 5) Verificar geometry
    expect(routeRes.body.route).toBeDefined();
    expect(Array.isArray(routeRes.body.route.geometry)).toBe(true);
    // puede ser > 2 porque OSRM devuelve muchos puntos
    expect(routeRes.body.route.geometry.length).toBeGreaterThan(0);
  });
});
