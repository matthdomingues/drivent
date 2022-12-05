import { prisma } from "@/config";

async function findBookingByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: { id: userId },
    include: {
      Room: true
    }
  });
}

async function postNewReservationByRoomId(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId
    }
  });
}

async function deleteReservation(bookingId: number) {
  return prisma.booking.delete({
    where: { id: bookingId }
  });
}

async function findRoomById(roomId: number) {
  return prisma.room.findFirst({
    where: { id: roomId },
    include: {
      Booking: true
    }
  });
}

async function findUserId(userId: number) {
  return prisma.user.findFirst({
    where: { id: userId }
  });
}

const bookingRepository = {
  findBookingByUserId,
  findRoomById,
  findUserId,
  postNewReservationByRoomId,
  deleteReservation
};

export default bookingRepository;
