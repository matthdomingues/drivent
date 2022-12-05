import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/booking-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const booking = await bookingService.findBooking(Number(userId));

    const reservation = {
      id: booking.id,
      Room: booking.Room,
    };

    return res.status(httpStatus.OK).send(reservation);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;

  try {
    const newReservation = await bookingService.postBooking(Number(userId), Number(roomId));

    return res.status(httpStatus.OK).send({ bookingId: newReservation.id });
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    if (error.name === "ForbiddenError") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
  }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;
  const { bookingId } = req.params;

  try {
    const updatedReservation = await bookingService.updateBooking(Number(userId), Number(roomId), Number(bookingId));

    return res.status(httpStatus.OK).send({ bookingId: updatedReservation.id });
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    if (error.name === "ForbiddenError") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
  }
}
