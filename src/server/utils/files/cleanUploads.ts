import fs from "fs/promises";
import getUploadPath from "../getUploadPath/getUploadPath";

const cleanUploads = async () => {
  const uploads = await fs.readdir("uploads");

  uploads.forEach(async (file) => {
    await fs.unlink(getUploadPath(file));
  });
};

export default cleanUploads;
