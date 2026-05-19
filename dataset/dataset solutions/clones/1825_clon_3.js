const calculateTotalMinutes = (hourValue, minuteValue) => {
  const minutesInAnHour = 60;
  return (hourValue * minutesInAnHour) + minuteValue;
};

function CalculateTimeDifference(rawInputString) {
  const inputLines = rawInputString.split("\n");
  const firstLine = inputLines[0];

  const [h1Str, m1Str, h2Str, m2Str, kStr] = firstLine.split(' ');

  const initialHour = parseInt(h1Str, 10);
  const initialMinute = parseInt(m1Str, 10);
  const finalHour = parseInt(h2Str, 10);
  const finalMinute = parseInt(m2Str, 10);
  const deductionAmount = parseInt(kStr, 10);

  const initialTotalMinutes = calculateTotalMinutes(initialHour, initialMinute);
  const finalTotalMinutes = calculateTotalMinutes(finalHour, finalMinute);

  const durationInMinutes = finalTotalMinutes - initialTotalMinutes;
  const computedDifference = durationInMinutes - deductionAmount;

  console.log(computedDifference);
}

CalculateTimeDifference(require("fs").readFileSync("/dev/stdin", "utf8"));
