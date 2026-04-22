function processIncoming(incomingData) {
  const separatorPosition = incomingData.indexOf(' ');
  const firstSegment = incomingData.substring(0, separatorPosition);
  const secondSegment = incomingData.substring(separatorPosition + 1);

  const entityOne = parseInt(firstSegment, 10);
  const entityTwo = parseInt(secondSegment, 10);

  const parityOne = entityOne & 1;
  const parityTwo = entityTwo & 1;

  const isProductOdd = (parityOne === 1 && parityTwo === 1);

  const resultMapping = new Map();
  resultMapping.set(true, 'Odd');
  resultMapping.set(false, 'Even');

  console.log(resultMapping.get(isProductOdd));
}
processIncoming(require("fs").readFileSync("/dev/stdin", "utf8"));