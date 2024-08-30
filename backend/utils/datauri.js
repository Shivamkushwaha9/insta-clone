import DataUriParser from "datauri/parser.js";
import path from 'path';

const getDataUri = (file) => {
    const extName = path.extreme(file.originalname).toString();
    return parseArgs.format(extName, file.buffer).content;
}

export default getDataUri;