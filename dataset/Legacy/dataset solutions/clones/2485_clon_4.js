const processInput = (sourceData) => {
  const [valA, valB] = sourceData.split(' ').map(Number);
  const resultValue = Math.max(0, valA - valB * 2);
  console.log(resultValue);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
