import type { CustomRequest } from "../../middleware/auth/types";
import fileFilter from "./fileFilter";

const req: Partial<CustomRequest> = {};

describe("Given the function fileFilter", () => {
  describe("When it receives a custom request, no image file and a file filter callback", () => {
    test("Then it should invoke the callback with null and false", () => {
      const callback = jest.fn();

      fileFilter(req as CustomRequest, undefined, callback);

      expect(callback).toHaveBeenCalledWith(null, false);
    });
  });
});
