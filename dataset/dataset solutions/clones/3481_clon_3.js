const calculateGCD = (num1, num2) => {
  let remainder;

  // Ensure num1 >= num2 for Euclidean algorithm
  if (num1 < num2) {
    [num1, num2] = [num2, num1]; // Destructuring assignment for swap
  }

  while ((remainder = num1 % num2) !== 0) {
    num1 = num2;
    num2 = remainder;
  }

  return num2;
};

const processInput = (rawData) => {
  const lines = rawData.split("\n");
  const firstLineParts = lines[0].split(" ");

  const lenS = Number(firstLineParts[0]);
  const lenT = Number(firstLineParts[1]);

  const strS = lines[1];
  const strT = lines[2];

  const commonMultiple = (lenS * lenT) / calculateGCD(lenT, lenS);

  let extractedS = "";
  let extractedT = "";

  const stepS = commonMultiple / lenT;
  for (let idx = 0; idx < lenS; idx += stepS) {
    extractedS += strS[idx];
  }

  const stepT = commonMultiple / lenS;
  for (let idx = 0; idx < lenT; idx += stepT) {
    extractedT += strT[idx];
  }

  return extractedS === extractedT ? commonMultiple : -1;
};

console.log(processInput(require("fs").readFileSync("/dev/stdin", "utf8")));
