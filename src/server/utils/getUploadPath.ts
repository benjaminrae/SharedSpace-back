import path from "path";

const getUploadPath = (fileName: string) => path.join("uploads", fileName);

export default getUploadPath;
