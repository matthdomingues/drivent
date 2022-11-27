import { prisma } from "@/config";

async function findHotels() {
  return prisma.hotel.findMany();
}

async function findHotelWithRooms(hotelId: number) {
  return prisma.hotel.findFirst({
    where: { id: hotelId },
    include: {
      Rooms: true
    }
  });
}

async function findEnrollmentById(userId: number) {
  return prisma.enrollment.findFirst({
    where: { userId }
  });
}

async function findTicketByEnrollmentId(enrollmentId: number) {
  return prisma.ticket.findFirst({
    where: {
      enrollmentId,
    },
    include: {
      TicketType: true
    }
  });
}

const hotelsRepository = {
  findHotels, findEnrollmentById, findTicketByEnrollmentId, findHotelWithRooms
};

export default hotelsRepository;
