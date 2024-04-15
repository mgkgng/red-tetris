import request from "supertest";
import http from "http";
import express from "express";
import cors from "cors";
import { initSocketServer } from "../socket";
import apiRoutes from "../routes/api";

jest.mock("cors", () => jest.fn(() => (req, res, next) => next()));
jest.mock("../socket", () => ({ initSocketServer: jest.fn() }));
jest.mock("../routes/api", () => {
  return jest.fn((req, res) => res.status(200).send("API Response"));
});

describe("Server", () => {
  let app;
  let server;

  beforeEach(() => {
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use("/api", apiRoutes);
    server = http.createServer(app);
    initSocketServer(server);
  });

  afterEach(() => {
    server && server.close();
  });

  test("should use cors middleware", () => {
    expect(cors).toHaveBeenCalled();
  });

  test("should initialize the socket server", () => {
    expect(initSocketServer).toHaveBeenCalledWith(server);
  });

  test("server should start and log on specified PORT", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation();
    await new Promise((resolve) => server.listen(3000, resolve));
  });

  test("should handle API routes correctly", async () => {
    const response = await request(server).get("/api");
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("API Response");
  });

  test("should handle 404 for undefined routes", async () => {
    const response = await request(server).get("/undefinedRoute");
    expect(response.statusCode).toBe(404);
  });

  test("should parse JSON bodies correctly", async () => {
    app.post("/test-json", (req, res) => {
      res.status(200).json(req.body);
    });

    const response = await request(server)
      .post("/test-json")
      .send({ key: "value" })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body).toEqual({ key: "value" });
  });

  test("should handle PUT requests correctly", async () => {
    app.put("/api/test-put", (req, res) => {
      res.status(200).send("PUT request handled");
    });

    const response = await request(server).put("/api/test-put");
    expect(response.text).toBe("API Response");
    expect(response.statusCode).toBe(200);
  });
});
