const rawContent = require("fs").readFileSync("/dev/stdin", "utf8");
const numericTokens = rawContent.match(/\d+/g).map(Number);

const [startHour, startMinute, endHour, endMinute, deduction] = numericTokens;

const convertToMinutes = (hr, min) => hr * 60 + min;

const startTimeInMinutes = convertToMinutes(startHour, startMinute);
const endTimeInMinutes = convertToMinutes(endHour, endMinute);

const rawDuration = endTimeInMinutes - startTimeInMinutes - deduction;

console.log(Math.max(0, rawDuration));
