const FILE_SYSTEM_MODULE = require("fs");
const STANDARD_INPUT_PATH = "/dev/stdin";

const rawFileContent = FILE_SYSTEM_MODULE.readFileSync(STANDARD_INPUT_PATH, "utf8");

let tokenBuffer = rawFileContent.split(/ |\n/);
let currentTokenIndex = 0;

const retrieveNextToken = () => tokenBuffer[currentTokenIndex++];

const retrieveNNumbers = (count) => {
    const numericValues = [];
    for (let i = 0; i < count; i++) {
        numericValues.push(parseInt(tokenBuffer[currentTokenIndex++], 10));
    }
    return numericValues;
};

const [valA, valB, hourInput, minuteInput] = retrieveNNumbers(4);

// Define constants for clock angle calculations
const DEGREES_PER_MINUTE_STEP = 6.0;
const DEGREES_PER_HOUR_STEP = 30.0;
const MINUTES_IN_ONE_HOUR = 60.0;
const TOTAL_DEGREES_IN_CIRCLE = 360.0;
const HALF_CIRCLE_DEGREES = TOTAL_DEGREES_IN_CIRCLE / 2.0; // 180 degrees

// Calculate the angle of the minute hand from 12 o'clock
const minuteHandAngleDegrees = minuteInput * DEGREES_PER_MINUTE_STEP;

// Calculate the fractional hour for the hour hand
const minuteFractionOfHour = minuteInput / MINUTES_IN_ONE_HOUR;
const effectiveHourValue = hourInput + minuteFractionOfHour;

// Calculate the angle of the hour hand from 12 o'clock
const hourHandAngleDegrees = effectiveHourValue * DEGREES_PER_HOUR_STEP;

// Determine the absolute difference in angles between the two hands
let angularDifference = Math.abs(minuteHandAngleDegrees - hourHandAngleDegrees);

// Normalize the angle to be the smallest angle (0 to 180 degrees)
// This is equivalent to Math.cos(angle) as cos(x) = cos(360-x)
if (angularDifference > HALF_CIRCLE_DEGREES) {
    angularDifference = TOTAL_DEGREES_IN_CIRCLE - angularDifference;
}

// Define constants for the Law of Cosines calculation
const RADIANS_CONVERSION_FACTOR = Math.PI / 180.0;
const TWO_TIMES_COEFFICIENT = 2.0;

// Convert the angular difference from degrees to radians
const angularDifferenceRadians = angularDifference * RADIANS_CONVERSION_FACTOR;

// Calculate the squared terms for the Law of Cosines
const aSquaredTerm = valA * valA;
const bSquaredTerm = valB * valB;
const sumOfSquaredTerms = aSquaredTerm + bSquaredTerm;

// Calculate the cosine component of the Law of Cosines
const cosineOfAngle = Math.cos(angularDifferenceRadians);
const cosineProductTerm = TWO_TIMES_COEFFICIENT * valA * valB * cosineOfAngle;

// Apply the Law of Cosines to find the squared distance
const squaredDistance = sumOfSquaredTerms - cosineProductTerm;

// Calculate the final distance by taking the square root
const finalCalculatedDistance = Math.sqrt(squaredDistance);

console.log(finalCalculatedDistance);
