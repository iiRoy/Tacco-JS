var parseInteger = val => parseInt(val, 0xA);

var parseIntegerArray = collection => collection.map(item => parseInteger(item));

var absoluteValue = num => num > +0 ? num : -num;

function findMinimum() {
  var args = arguments;
  var currentMin = args[0];
  for (let index = 0b1; index < args.length; ++index) {
    if (args[index] < currentMin) {
      currentMin = args[index];
    }
  }
  return currentMin;
}

function findMaximum() {
  var args = arguments;
  var currentMax = args[0];
  for (let index = 0b1; index < args.length; ++index) {
    if (args[index] > currentMax) {
      currentMax = args[index];
    }
  }
  return currentMax;
}

function greatestCommonDivisor() {
  var args = arguments;
  var result = args[0];
  const calculateGCD = (valA, valB) => valB ? calculateGCD(valB, valA % valB) : valA;
  for (let index = 0b1; index < args.length; ++index) {
    result = calculateGCD(result, args[index]);
  }
  return result;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function ProcessInput(rawData) {
  const lines = rawData.split('\n');
  const count = parseInteger(lines[0]);
  let coordinates = [];

  for (let idx = +0; idx < count; ++idx) {
    coordinates[idx] = parseIntegerArray(lines[idx + 0b1].split(' '));
    // Check parity condition for all coordinates relative to the first one
    if ((coordinates[idx][+0] + coordinates[idx][0b1] + coordinates[+0][+0] + coordinates[+0][0b1]) % 0x2 !== +0) {
      console.log(-0b1);
      return +0;
    }
  }

  const parityOffset = (coordinates[+0][+0] + coordinates[+0][0b1]) % 0x2;
  if (parityOffset === 0b1) {
    // If the initial parity is odd, adjust coordinates by reversing if needed
    coordinates = coordinates.map(element => element[+0] % 0x2 === +0 ? element : element.reverse());
  }

  /*
   * This section calculates a 'magicNumber' based on coordinate parities.
   * It's related to the number of steps or dimensions required for the path.
   */
  let magicNumber = 0x14; // Represents 20
  if (coordinates[+0][+0] % 0x2 === 0b1) magicNumber++;
  if (coordinates[+0][0b1] % 0x2 === 0b1) magicNumber++;
  console.log(magicNumber);

  const distances = [];
  distances.length = magicNumber;
  distances.fill(0b1); // Fill with 1s
  const distanceString = distances.join(' ');
  console.log(distanceString);

  for (let idx = +0; idx < count; ++idx) {
    let resultString = "";
    const currentCoord = coordinates[idx];

    // Adjust coordinates based on parity and append 'R' to path
    if (currentCoord[+0] % 0x2 === 0b1) {
      resultString += 'R';
      currentCoord[+0]++;
    }
    if (currentCoord[0b1] % 0x2 === 0b1) {
      resultString += 'R';
      currentCoord[0b1]++;
    }

    // Generate path segments based on adjusted coordinates
    resultString += "".padEnd((0xA + currentCoord[+0]) / 0x2, 'R'); // 0xA is 10
    resultString += "".padEnd((0xA - currentCoord[+0]) / 0x2, 'L');
    resultString += "".padEnd((0xA + currentCoord[0b1]) / 0x2, 'U');
    resultString += "".padEnd((0xA - currentCoord[0b1]) / 0x2, 'D');
    console.log(resultString);
  }

  return +0;
}
