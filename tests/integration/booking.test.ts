import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicketType,
  createTicket,
  createHotel,
  createHotelwithRooms,
  createHotelwithFullRoom,
  createPayment,
  createBooking
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for the given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when user doesnt have an enrollment yet", async () => {
      const user = await createUser();
      const body = { userId: user.id };
      const token = await generateValidToken(user);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when user doesnt have a ticket yet", async () => {
      const user = await createUser();
      const body = { userId: user.id };
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when user doesnt have a booking yet", async () => {
      const user = await createUser();
      const body = { userId: user.id };
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and the booking data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const { hotel, room } = await createHotelwithRooms();
      const booking = await createBooking(user.id, room.id);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        }
      });
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for the given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 403 when user doesnt have an enrollment yet", async () => {
      const user = await createUser();
      const body = { userId: user.id };
      const token = await generateValidToken();

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user doesnt have a ticket yet", async () => {
      const user = await createUser();
      const body = { userId: user.id };
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user has a ticket without hotel included", async () => {
      const user = await createUser();
      const body = { userId: user.id };
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, false);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user has a remote ticket", async () => {
      const user = await createUser();
      const body = { userId: user.id };
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true, false);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when the ticket isnt paid", async () => {
      const user = await createUser();
      const body = { userId: user.id };
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when the room is full", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const { hotel, room } = await createHotelwithFullRoom();
      await createBooking(user.id, room.id);

      const body = { userId: user.id, roomId: room.id };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 404 when the room doesnt exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const { hotel, room } = await createHotelwithFullRoom();

      const body = { userId: user.id, roomId: room.id + 1 };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and the bookingId", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const { hotel, room } = await createHotelwithRooms();
      await createBooking(user.id, room.id);

      const body = { userId: user.id, roomId: room.id };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({ bookingId: response.body.bookingId });
    });
  });
});

describe("PUT /booking/:bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.put("/booking/1");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for the given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 403 when user doesnt have an enrollment yet", async () => {
      const user = await createUser();
      const body = { userId: user.id };
      const token = await generateValidToken();

      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user doesnt have a ticket yet", async () => {
      const user = await createUser();
      const body = { userId: user.id };
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user has a ticket without hotel included", async () => {
      const user = await createUser();
      const body = { userId: user.id };
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, false);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user has a remote ticket", async () => {
      const user = await createUser();
      const body = { userId: user.id };
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true, false);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when the ticket isnt paid", async () => {
      const user = await createUser();
      const body = { userId: user.id };
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when the room is full", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const { hotel, room } = await createHotelwithFullRoom();
      const boooking = await createBooking(user.id, room.id);

      const body = { userId: user.id, roomId: room.id };

      const response = await server.put(`/booking/${boooking.id}`).set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 404 when the room doesnt exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const { hotel, room } = await createHotelwithFullRoom();
      const boooking = await createBooking(user.id, room.id);

      const body = { userId: user.id, roomId: 0 };

      const response = await server.put(`/booking/${boooking.id}`).set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and the bookingId", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const { hotel, room } = await createHotelwithRooms();
      const booking = await createBooking(user.id, room.id);

      const body = { userId: user.id, roomId: room.id };

      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({ bookingId: response.body.bookingId });
    });
  });
});

