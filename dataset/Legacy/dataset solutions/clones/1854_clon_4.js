const fileSystem = require("fs");
const inputData = fileSystem.readFileSync("/dev/stdin", "utf8");

const numericValues = inputData.match(/\d+/g).map(Number);

const [lenA, lenB, currentHour, currentMinute] = numericValues;

const minuteHandAngleRad = currentMinute * (2 * Math.PI / 60);

const hourHandAngleRad = ((currentHour % 12) + currentMinute / 60) * (2 * Math.PI / 12);

let rawAngularDifference = Math.abs(minuteHandAngleRad - hourHandAngleRad);

const effectiveAngleRad = Math.min(rawAngularDifference, 2 * Math.PI - rawAngularDifference);

const squaredDistance = lenA**2 + lenB**2 - 2 * lenA * lenB * Math.cos(effectiveAngleRad);

const finalDistance = Math.sqrt(squaredDistance);

console.log(finalDistance);
