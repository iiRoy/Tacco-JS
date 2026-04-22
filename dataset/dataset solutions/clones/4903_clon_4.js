const processData = (sourceMaterial) => {
  const lineExtractionPattern = /(\d+)\s+\d+\n([\d\s]+)/;
  const extractedSegments = sourceMaterial.match(lineExtractionPattern);

  const keyParameter = Number(extractedSegments[1]);

  const numericSequence = extractedSegments[2].match(/\d+/g).map(Number);

  const greatestElement = numericSequence.reduce((accumulator, currentValue) => {
    return (currentValue > accumulator) ? currentValue : accumulator;
  }, -Infinity);

  const interimCalculation = (greatestElement << 1) - keyParameter - 1;
  const finalResult = (interimCalculation > 0) ? interimCalculation : 0;

  return finalResult;
};

((ioHandler) => {
  const rawDataPayload = ioHandler.readFileSync("/dev/stdin", "utf8");
  const computedValue = processData(rawDataPayload);
  process.stdout.write(String(computedValue) + '\n');
})(require("fs"));