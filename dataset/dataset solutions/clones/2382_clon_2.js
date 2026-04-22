function processData(rawData) {
  const linesOfText = rawData .split("\n");
  const timeParams = linesOfText[0].split(" ");
  const paramSetA = linesOfText[1].split(" ");
  const paramSetB = linesOfText[2].split(" ");

  const timeVal0 = timeParams[0];
  const timeVal1 = timeParams[1];

  const valA0 = paramSetA[0];
  const valA1 = paramSetA[1];

  const valB0 = paramSetB[0];
  const valB1 = paramSetB[1];

  let calcValX = timeVal0 * (valA0 - valB0);
  let calcValY = (timeVal1 * valA1 + calcValX) - (timeVal1 * valB1);

  if ( Math.sign(calcValX) == Math.sign(calcValY) ) {
    console.log(0);
  } else if ( calcValY == 0 ) {
    console.log("infinity");
  } else {
    calcValX = Math.abs(calcValX);
    calcValY = Math.abs(calcValY);
    if ( calcValX % calcValY == 0 ) {
      console.log((calcValX / calcValY) * 2);
    } else {
      console.log(Math.ceil(calcValX / calcValY) * 2 - 1);
    }
  }
}
processData(require("fs").readFileSync("/dev/stdin", "utf8"));