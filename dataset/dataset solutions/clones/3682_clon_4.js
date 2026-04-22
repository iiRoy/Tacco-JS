const processData = (rawData) => {
  const parts = rawData.split('\n');
  const sourceString = parts[0];
  const jumpSize = parseInt(parts[1], 10);

  const resultString = Array.from({ length: sourceString.length }, (_, currentIdx) => currentIdx)
    .filter(index => index % jumpSize === 0)
    .map(index => sourceString[index])
    .join('');

  console.log(resultString);
};

processData(require("fs").readFileSync("/dev/stdin", "utf8").trim());