process.stdin.setEncoding("utf8");

process.stdin.on("data", (rawData) => {
  // Input format: side1 side2 hour minute
  const parsedValues = rawData.split(" ");

  const firstSide = parsedValues[0];
  const secondSide = parsedValues[1];
  const hourVal = parsedValues[2];
  const minuteVal = parsedValues[3];

  const finalDistance = computeDistance(firstSide, secondSide, hourVal, minuteVal);

  console.log(finalDistance);
});

const computeDistance = (firstSide, secondSide, hourVal, minuteVal) => {
  // Calculate the angle of the minute hand in radians
  const minAngleRad = (Math.PI * 2 * minuteVal) / 60;

  // Calculate the angle of the hour hand in radians, considering minute movement
  const hrAngleRad = Math.PI * 2 * (hourVal / 12 + minuteVal / 60 / 12);

  // Determine the angular difference between the two hands
  const angleDiff = minAngleRad - hrAngleRad;
  
  // Apply the Law of Cosines to find the distance between the hand tips
  return applyCosineRule(firstSide, secondSide, angleDiff);
};

const applyCosineRule = (sideA, sideB, angleC) => {
  // Using the formula: c = sqrt(a^2 + b^2 - 2ab * cos(C))
  return Math.sqrt(sideA * sideA + sideB * sideB - 2 * sideA * sideB * Math.cos(angleC));
};
