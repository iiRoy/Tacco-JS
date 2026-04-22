function processData(rawData) {
  const newlinePosition = rawData.indexOf('\n');
  const countString = rawData.substring(0, newlinePosition);
  const dataLine = rawData.substring(newlinePosition + 1);

  const parsedStrings = dataLine.split(/\s+/).filter(s => s.length > 0);
  const numericValues = parsedStrings.map(Number);

  const iterationCount = Number(countString);

  console.log(numericValues[0]);
  console.log(numericValues[1]);

  let totalReciprocal = Array.from({ length: iterationCount }, (_, index) => {
    const currentVal = numericValues[index];
    return 1 / currentVal;
  }).reduce((accumulator, reciprocal) => accumulator + reciprocal, 0);

  console.log(1 / totalReciprocal);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));