import { forbiddenError, notFoundError, unauthorizedError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import hotelsRepository from "@/repositories/hotels-repository";

export async function findBooking(userId: number) {
  await userValidation(userId);

  const booking = await bookingRepository.findBookingByUserId(userId);

  if (!booking) { throw notFoundError(); }

  return booking;
}

export async function postBooking(userId: number, roomId: number) {
  await userValidation(userId);
  await ticketValidation(userId);
  await roomValidation(roomId);

  const newRoom = await bookingRepository.postNewReservationByRoomId(userId, roomId);
  return newRoom;
}

export async function updateBooking(userId: number, roomId: number, bookingId: number) {
  await userValidation(userId);
  await ticketValidation(userId);
  await bookingValidation(userId, bookingId);
  await roomValidation(roomId);

  const updatedReservation = await bookingRepository.postNewReservationByRoomId(userId, roomId);
  await bookingRepository.deleteReservation(bookingId);
  return updatedReservation;
}

async function userValidation(userId: number) {
  const user = await bookingRepository.findUserId(userId);

  if (!user) { throw notFoundError(); }
}

async function ticketValidation(userId: number) {
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

async function bookingValidation(userId: number, bookingId: number) {
  const booking = await bookingRepository.findBookingByUserId(userId);
  if (!booking || booking.id !== bookingId) { throw forbiddenError(); }
}

async function roomValidation(roomId: number) {
  const room = await bookingRepository.findRoomById(roomId);

  if (!room) { throw notFoundError(); }
  if (room.Booking.length === room.capacity) { throw forbiddenError(); }
}

const bookingService = {
  findBooking, postBooking, updateBooking
};

export default bookingService;
