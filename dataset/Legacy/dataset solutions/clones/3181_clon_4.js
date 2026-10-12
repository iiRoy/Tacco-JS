const computeAndOutput = (sourceData) => {
  const processedLines = sourceData.trim().split('\n');
  const [valAStr, valBStr] = processedLines[0].split(' ');

  const valA = +valAStr;
  const valB = +valBStr;

  const isDivisible = Number(valB % valA === 0);

  const finalResult = isDivisible * (valA + valB) + (1 - isDivisible) * (valB - valA);

  console.log(finalResult);
};

computeAndOutput(require("fs").readFileSync("/dev/stdin", "utf8"));
