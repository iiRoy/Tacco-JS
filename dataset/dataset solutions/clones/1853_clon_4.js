process.stdin.setEncoding("utf8");
process.stdin.on("data", (inputLine) => {
  const numericValues = inputLine.split(" ").map(Number);
  const [sideOne, sideTwo, currentHour, currentMinute] = numericValues;
  const finalOutcome = calculateHypotenuse(sideOne, sideTwo, currentHour, currentMinute);
  console.log(finalOutcome);
});

const calculateHypotenuse = (lengthA, lengthB, hourValue, minuteValue) => {
  const minuteHandDegrees = minuteValue * 6;
  const hourHandDegrees = (hourValue % 12) * 30 + minuteValue * 0.5;
  
  const rawAngleDifference = Math.abs(minuteHandDegrees - hourHandDegrees);
  const effectiveCentralAngleDegrees = Math.min(rawAngleDifference, 360 - rawAngleDifference);
  
  const centralAngleRadians = effectiveCentralAngleDegrees * (Math.PI / 180);
  
  const termX = Math.pow(lengthA, 2);
  const termY = Math.pow(lengthB, 2);
  const termZ = 2 * lengthA * lengthB * Math.cos(centralAngleRadians);
  
  return Math.sqrt(termX + termY - termZ);
};
