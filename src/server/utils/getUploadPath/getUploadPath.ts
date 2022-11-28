import { environment } from "../../../loadEnvironment";

const { uploadPath } = environment;
import path from "path";

const getUploadPath = (fileName: string) => path.join(uploadPath, fileName);

export default getUploadPath;
