import fs from "fs/promises";

const doesFileExist = async (filePath: string): Promise<boolean> => {
  let file: fs.FileHandle;
  try {
    file = await fs.open(filePath);
    return true;
  } catch {
    return false;
  } finally {
    await file.close();
  }
};

export default doesFileExist;
