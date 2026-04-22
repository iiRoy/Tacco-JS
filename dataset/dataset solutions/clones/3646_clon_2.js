let inputStr; let charArray;
const primeModulus = (10 ** 9) + 7;

const readInterfaceModule = require('readline');
const interfaceInstance = readInterfaceModule.createInterface({
  dataStreamIn:  process.stdin,
  dataStreamOut: process.stdout,
});

interfaceInstance.on('line', function (currentLine) {
    inputStr = currentLine;
});

interfaceInstance.on('close', function () {
  charArray = inputStr.split("");
  let dynamicProgression = Array(charArray.length + 1);

  for (let outerIndex = 0; outerIndex <= charArray.length; outerIndex++) {
    dynamicProgression[outerIndex] = Array(4).fill(0);
  }

  for (let outerIndex = charArray.length; outerIndex >= 0; outerIndex--) {
    for (let innerIndex = 3; innerIndex >= 0; innerIndex--) {
      if (outerIndex === charArray.length) {
        dynamicProgression[outerIndex][innerIndex] = (innerIndex === 3 ? 1 : 0);
      } else {
        dynamicProgression[outerIndex][innerIndex] = dynamicProgression[outerIndex + 1][innerIndex] * (charArray[outerIndex] === '?' ? 3 : 1);
        if (innerIndex < 3 && (charArray[outerIndex] === '?' || charArray[outerIndex] === "ABC"[innerIndex])) {
          dynamicProgression[outerIndex][innerIndex] += dynamicProgression[outerIndex + 1][innerIndex + 1];
        }
        dynamicProgression[outerIndex][innerIndex] %= primeModulus;
      }
    }
  }
  console.log(dynamicProgression[0][0]);
});