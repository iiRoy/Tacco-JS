function processInputData(rawData) {
  const lines = rawData.split("\n");

  const itemCount = parseInt(lines[0], 10);

  const thresholdsStr = lines[1].split(" ");
  const thresholdA = parseInt(thresholdsStr[0], 10);
  const thresholdB = parseInt(thresholdsStr[1], 10);

  const rawNumbers = lines[2].split(" ");
  const numericValues = rawNumbers.map(val => parseInt(val, 10));

  const groupOne = [];
  const groupTwo = [];
  const groupThree = [];

  const assignToGroup = (value, limitA, limitB, arr1, arr2, arr3) => {
    if (value <= limitA) {
      arr1.push(value);
    } else if (value <= limitB) {
      arr2.push(value);
    } else {
      arr3.push(value);
    }
  };

  for (let idx = 0; idx < itemCount; idx++) {
    const currentValue = numericValues[idx];
    assignToGroup(currentValue, thresholdA, thresholdB, groupOne, groupTwo, groupThree);
  }

  const len1 = groupOne.length;
  const len2 = groupTwo.length;
  const len3 = groupThree.length;
  const resultMinLength = Math.min(len1, len2, len3);

  console.log('%s', resultMinLength);
}

function runDebug() {
  const inputElement = document.getElementById("input");
  if (inputElement) {
    const debugInput = inputElement.value;
    processInputData(debugInput);
  } else {
    console.error("Input element not found for debugging.");
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
