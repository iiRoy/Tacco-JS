function processInputData(rawData) {
  const inputSegments = rawData.split(' ');

  const valA = Number(inputSegments[0]);
  const valB = Number(inputSegments[1]);
  const valC = Number(inputSegments[2]);

  const isTargetWithinRange = (valC >= valA) && (valC <= valB);

  const positiveResultText = 'Yes';
  const negativeResultText = 'No';

  if (isTargetWithinRange) {
    console.log(positiveResultText);
  } else {
    console.log(negativeResultText);
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
