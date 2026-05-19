function processValues(dataArr) {
  const valP = +dataArr[0];
  const valQ = +dataArr[1];
  const valR = +dataArr[2];
  const outputOptions = [valQ + valR, "Hello World"];
  console.log(outputOptions[Number(valQ === 1)]);
}
processValues(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
