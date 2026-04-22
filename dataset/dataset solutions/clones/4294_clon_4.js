const processData = (rawText) => {
  const numericValues = rawText.match(/-?\d+/g).map(Number);
  const [valOne, valTwo, valThree] = numericValues;
  const distinctElement = valOne ^ valTwo ^ valThree;
  console.log(distinctElement);
};
processData(require("fs").readFileSync("/dev/stdin", "utf8"));