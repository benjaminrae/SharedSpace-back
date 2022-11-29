import fs from "fs/promises";
import getUploadPath from "../getUploadPath/getUploadPath.js";

const cleanUploads = async () => {
  const uploads = await fs.readdir("uploads");

  uploads.forEach(async (file) => {
    if (/mockImage.jpg/.exec(file)) {
      return;
    }

    await fs.unlink(getUploadPath(file));
  });
};

export default cleanUploads;
