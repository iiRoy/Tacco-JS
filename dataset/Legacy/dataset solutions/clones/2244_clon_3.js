const fileSystemModule = require("fs");

const STANDARD_INPUT_FILE_DESCRIPTOR = 0;
const DEFAULT_INITIAL_ARRAY_VALUE = 7;

const rawBufferContent = fileSystemModule.readFileSync(STANDARD_INPUT_FILE_DESCRIPTOR);
const stringContent = rawBufferContent.toString();
const splitInputParts = stringContent.split(" ");

const targetArraySize = Number(splitInputParts[0]);
const fillOperationEndIndex = Number(splitInputParts[1]);
const valueToFillWith = Number(splitInputParts[2]);

const baseArray = new Array(targetArraySize);
const initializedArray = baseArray.fill(DEFAULT_INITIAL_ARRAY_VALUE);

const finalArrayState = initializedArray.fill(valueToFillWith, 0, fillOperationEndIndex);
const outputStringRepresentation = finalArrayState.join(" ");

console.log(outputStringRepresentation);
