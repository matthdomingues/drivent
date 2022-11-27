import hotelsRepository from "@/repositories/hotels-repository";
import { notFoundError, unauthorizedError } from "@/errors";

export async function findAllHotels(userId: number) {
  await userValidation(userId);

  const hotels = await hotelsRepository.findHotels();
  return hotels;
}

export async function findHotelRooms(userId: number, hotelId: number) {
  await userValidation(userId);

  const hotelwithRooms = await hotelsRepository.findHotelWithRooms(hotelId);

  if (!hotelwithRooms) { throw notFoundError(); }

  return hotelwithRooms;
}

async function userValidation(userId: number) {
  const enrollment = await getEnrollment(userId);

  await getTicket(enrollment.id);
}

async function getEnrollment(userId: number) {
  const enrollment = await hotelsRepository.findEnrollmentById(userId);

  if (!enrollment) { throw notFoundError(); }

  return enrollment;
}

async function getTicket(enrollmentId: number) {
  const ticket = await hotelsRepository.findTicketByEnrollmentId(enrollmentId);

  if (!ticket) { throw notFoundError(); }

  if (ticket.status === "RESERVED") { throw unauthorizedError(); }

  if (ticket.TicketType.includesHotel === false || ticket.TicketType.isRemote === true) {
    throw unauthorizedError();
  }
}

const hotelsService = {
  findAllHotels, findHotelRooms
};

export default hotelsService;
