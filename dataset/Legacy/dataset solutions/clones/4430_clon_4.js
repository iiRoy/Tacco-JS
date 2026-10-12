function processInputData(rawData) {
  const trimmedContent = rawData.trim();
  const spacePosition = trimmedContent.indexOf(' ');

  const firstPart = trimmedContent.substring(0, spacePosition);
  const secondPart = trimmedContent.substring(spacePosition + 1);

  const valueOne = +firstPart;
  const valueTwo = +secondPart;

  const finalResult = valueOne + valueTwo - 2;

  console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
