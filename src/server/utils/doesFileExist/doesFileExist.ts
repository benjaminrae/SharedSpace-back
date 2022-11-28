import fs from "fs/promises";

const doesFileExist = async (filePath: string): Promise<boolean> => {
  let file: fs.FileHandle;
  try {
    file = await fs.open(filePath);
    await file.close();
    return true;
  } catch {
    return false;
  }
};

export default doesFileExist;
