import path from "path";
import { environment } from "../../../loadEnvironment";
import getUploadPath from "./getUploadPath";

const { uploadPath } = environment;

describe("Given getUploadPath", () => {
  describe("When it receives file name 'image.jpg'", () => {
    test("Then it should return 'uploads/image.jpg'", () => {
      const fileName = "image.jpg";

      const filePath = getUploadPath(fileName);

      expect(filePath).toBe(path.join(uploadPath, fileName));
    });
  });
});
