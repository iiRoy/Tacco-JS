'use strict'

function retrieveDayValue(dayString, labelArray, valueArray) {
  const foundIndex = labelArray.indexOf(dayString);
  // This preserves the original behavior: if dayString is not found,
  // foundIndex will be -1, and valueArray[-1] will correctly yield undefined.
  return valueArray[foundIndex];
}

function ProcessDayData(sourceData) {
  const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dayValues = [7, 6, 5, 4, 3, 2, 1];

  const lineDelimiter = "\n";
  const firstContentLine = sourceData.split(lineDelimiter)[0];
  let currentDayIdentifier = firstContentLine;

  let computedValue = retrieveDayValue(currentDayIdentifier, dayLabels, dayValues);
  console.log(computedValue);
}

ProcessDayData(require("fs").readFileSync("/dev/stdin", "utf8"));
