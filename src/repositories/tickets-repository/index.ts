import { prisma } from "@/config";
import { UserTicket } from "@/protocols";

async function findTicketType() {
  return prisma.ticketType.findMany();
}

async function findAllTickets(userId: number): Promise<UserTicket> {
  return prisma.ticket.findFirst({
    where: {
      Enrollment: {
        userId: userId,
      },
    },
    include: {
      TicketType: true,
    },
  });
}

async function findUserEnrollment(userId: number) {
  return await prisma.enrollment.findFirst({
    where: {
      userId
    }
  });
}

async function createTicket(ticketTypeId: number, enrollmentId: number) {
  return prisma.ticket.create({
    data: {
      ticketTypeId: ticketTypeId,
      enrollmentId: enrollmentId,
      status: "RESERVED"
    },
    include: {
      TicketType: true,
    }
  });
}

const ticketsRepository = {
  findTicketType,
  findAllTickets,
  findUserEnrollment,
  createTicket
};

export default ticketsRepository;
