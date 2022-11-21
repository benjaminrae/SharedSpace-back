class CustomError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public publicMessage: string
  ) {
    super(message);
  }
}

export default CustomError;
