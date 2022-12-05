import { ApplicationError } from "@/protocols";

export function forbiddenError(): ApplicationError {
  return {
    name: "ForbiddenError",
    message: "You must choose a valid data to continue",
  };
}
