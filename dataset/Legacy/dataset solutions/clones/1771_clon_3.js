function processInputData(rawDataString) {
  const dataParts = rawDataString.split(" ");

  const valX = parseInt(dataParts[0], 10);
  const valY = parseInt(dataParts[1], 10);

  const isSecondValueEven = (valY % 2 === 0);

  const halfOfSecondValue = valY / 2;

  const derivedCalculation = (2 * valX) - halfOfSecondValue;

  if (isSecondValueEven && derivedCalculation >= 0) {
    console.log('Yes');
  } else {
    console.log("No");
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
