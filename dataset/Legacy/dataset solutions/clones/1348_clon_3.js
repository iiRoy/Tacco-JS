const fileSystemModule = require("fs");
const inputFilePath = "/dev/stdin";
const encodingType = "utf8";

let rawInputData = fileSystemModule.readFileSync(inputFilePath, encodingType);

let circleRadius = +rawInputData;

const PI_CONSTANT = Math.PI;

let radiusSquared = Math.pow(circleRadius, 2);

let radiusDoubled = circleRadius * 2;

let areaValue = radiusSquared * PI_CONSTANT;

let circumferenceValue = radiusDoubled * PI_CONSTANT;

let formattedArea = areaValue.toFixed(6);

let formattedCircumference = circumferenceValue.toFixed(6);

let finalOutputString = formattedArea + ' ' + formattedCircumference;

console.log(finalOutputString);
