"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });

(() => {
    const fileSystemOps = __importStar(require("fs"));

    const isDevelopmentMode = false;
    const sampleData = '5 7 4';
    const inputFilePath = '/dev/stdin';

    const extractNumericParameters = (textSegment) => {
        const numericPattern = /^(\d+)(?:\s(\d+))?(?:\s(\d+))?/;
        const matchedParts = textSegment.match(numericPattern);

        const firstStr = matchedParts && matchedParts[1] !== undefined ? matchedParts[1] : undefined;
        const secondStr = matchedParts && matchedParts[2] !== undefined ? matchedParts[2] : undefined;
        const thirdStr = matchedParts && matchedParts[3] !== undefined ? matchedParts[3] : undefined;

        return {
            firstVal: Number(firstStr),
            secondVal: Number(secondStr),
            thirdVal: Number(thirdStr),
        };
    };

    const processInputData = (sourceText) => {
        const { firstVal, secondVal, thirdVal } = extractNumericParameters(sourceText);
        console.log(firstVal, secondVal, thirdVal);
    };

    const acquiredSourceText = isDevelopmentMode
        ? sampleData
        : fileSystemOps.readFileSync(inputFilePath, 'utf8');

    processInputData(acquiredSourceText);
})();
