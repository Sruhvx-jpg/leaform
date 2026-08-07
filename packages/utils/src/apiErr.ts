class apiErr extends Error {
  statuscode: number;
  isOperational: boolean;
  constructor(statuscode: number, message: string) {
    super(message);
    this.statuscode = statuscode;
    this.isOperational = true;
  }

  static badRequest(message = "Bad request.") {
    return new apiErr(400, message);
  }

  static dataNotFound(message = "Requested data could not be found.") {
    return new apiErr(404, message);
  }

  static dataAlreadyExist(message = "An account with this email already exists.") {
    return new apiErr(409, message);
  }

  static unauthorizedAccess(message = "Invalid email or password.") {
    return new apiErr(401, message);
  }

  static unknownErr(message = "An unexpected error occurred. Please try again later.") {
    return new apiErr(500, message);
  }
}

export default apiErr;
