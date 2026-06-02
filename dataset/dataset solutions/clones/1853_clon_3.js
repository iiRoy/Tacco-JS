process.stdin.setEncoding("utf8");

const TWO_PI = Math.PI * 2;
const MINUTES_IN_HOUR = 60;
const HOURS_ON_CLOCK = 12;

const handleInputData = rawData => {
  const parsedValues = rawData.split(" ");
  const sideA = parseFloat(parsedValues[0]);
  const sideB = parseFloat(parsedValues[1]);
  const clockHour = parseFloat(parsedValues[2]);
  const clockMinute = parseFloat(parsedValues[3]);

  const finalDistance = computeClockHandDistance(sideA, sideB, clockHour, clockMinute);
  console.log(finalDistance);
};

process.stdin.on("data", handleInputData);

const computeClockHandDistance = (sideA, sideB, clockHour, clockMinute) => {
  const minuteHandAngleRad = (TWO_PI * clockMinute) / MINUTES_IN_HOUR;

  const hourFraction = clockHour / HOURS_ON_CLOCK;
  const minuteContributionToHour = clockMinute / (MINUTES_IN_HOUR * HOURS_ON_CLOCK);
  const totalHourPosition = hourFraction + minuteContributionToHour;
  const hourHandAngleRad = TWO_PI * totalHourPosition;

  const angleBetweenHands = minuteHandAngleRad - hourHandAngleRad;

  return calculateLengthUsingCosineRule(sideA, sideB, angleBetweenHands);
};

const calculateLengthUsingCosineRule = (sideA, sideB, angleBetweenHands) => {
  const termA_squared = Math.pow(sideA, 2);
  const termB_squared = Math.pow(sideB, 2);
  const cosineTerm = 2 * sideA * sideB * Math.cos(angleBetweenHands);
  const sumOfSquaresMinusCosineTerm = termA_squared + termB_squared - cosineTerm;
  return Math.sqrt(sumOfSquaresMinusCosineTerm);
};
