import CustomError from "./CustomError";

describe("Given the class CustomError", () => {
  describe("When it is instantiated with message 'There was an error', statusCode 500 and public message 'Something went wrong on the server", () => {
    test("Then it should return an object with those properties and values and is an instance of Error", () => {
      const expectedError = {
        message: "There was an error",
        statusCode: 500,
        publicMessage: "Something went wrong on the server",
      };

      const newCustomError = new CustomError(
        expectedError.message,
        expectedError.statusCode,
        expectedError.publicMessage
      );

      expect(newCustomError).toHaveProperty("message", expectedError.message);
      expect(newCustomError).toHaveProperty(
        "statusCode",
        expectedError.statusCode
      );
      expect(newCustomError).toHaveProperty(
        "publicMessage",
        expectedError.publicMessage
      );
      expect(newCustomError).toBeInstanceOf(Error);
    });
  });
});
