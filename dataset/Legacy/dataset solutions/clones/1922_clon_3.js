"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fileSystem = __importStar(require("fs"));
{
    const IS_DEBUG_MODE_ACTIVE = false;
    const STANDARD_INPUT_FILE_PATH = '/dev/stdin';
    const parseInputStringData = (rawInputText) => {
        const stringParts = rawInputText.split(' ');
        const [strA, strB, strN] = stringParts;
        const numericA = Number(strA);
        const numericB = Number(strB);
        const numericN = Number(strN);
        return {
            valA: numericA,
            valB: numericB,
            valN: numericN,
        };
    };
    const executeCoreLogic = (inputArguments) => {
        const { valA, valB, valN } = parseInputStringData(inputArguments);
        console.log(valA, valB, valN);
    };
    let programInputSource;
    if (IS_DEBUG_MODE_ACTIVE) {
        const DEBUG_SAMPLE_DATA = '5 7 4';
        programInputSource = DEBUG_SAMPLE_DATA;
    }
    else {
        programInputSource = fileSystem.readFileSync(STANDARD_INPUT_FILE_PATH, 'utf8');
    }
    executeCoreLogic(programInputSource);
}
