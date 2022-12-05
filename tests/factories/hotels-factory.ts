import faker from "@faker-js/faker";
import { prisma } from "@/config";

export async function createHotel() {
  return prisma.hotel.create({
    data: {
      name: faker.company.companyName(),
      image: faker.image.business()
    }
  });
}

export async function createHotelwithRooms() {
  const hotel = await prisma.hotel.create({
    data: {
      name: faker.company.companyName(),
      image: faker.image.business()
    }
  });

  const room = await prisma.room.create({
    data: {
      name: faker.animal.type(),
      capacity: faker.datatype.number({ min: 1, max: 4 }),
      hotelId: hotel.id
    }
  });

  return ({ hotel, room });
}

export async function createHotelwithFullRoom() {
  const hotel = await prisma.hotel.create({
    data: {
      name: faker.company.companyName(),
      image: faker.image.business()
    }
  });

  const room = await prisma.room.create({
    data: {
      name: faker.animal.type(),
      capacity: 1,
      hotelId: hotel.id
    }
  });

  return ({ hotel, room });
}
