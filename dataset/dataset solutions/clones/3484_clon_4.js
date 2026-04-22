const obtainNumericValue = (txt) => Number.parseInt(txt, 10);

const obtainFloatingValue = (txt) => Number.parseFloat(txt);

const determineCommonDivisor = (valOne, valTwo) => {
  const positiveOne = Math.abs(valOne);
  const positiveTwo = Math.abs(valTwo);
  return positiveTwo === 0 ? positiveOne : determineCommonDivisor(positiveTwo, positiveOne % positiveTwo);
};

const determineCommonMultiple = (factorA, factorB) => {
  if (typeof factorA !== 'number' || typeof factorB !== 'number') return NaN;
  if (factorA === 0 || factorB === 0) return 0;
  return (Math.abs(factorA * factorB) / determineCommonDivisor(factorA, factorB));
};

const processSolution = (inputSourceText) => {
  const lineItems = inputSourceText.split('\n');

  const [dimensionA, dimensionB] = lineItems[0].split(' ').map(obtainNumericValue);
  const sequenceA = lineItems[1];
  const sequenceB = lineItems[2];

  if (sequenceA.charCodeAt(0) !== sequenceB.charCodeAt(0)) {
    return -1;
  }

  const resultLCM = determineCommonMultiple(dimensionA, dimensionB);
  const resultGCD = determineCommonDivisor(dimensionA, dimensionB);

  const isAllConsistent = Array.from({ length: resultGCD }).every((_, commonIdx) => {
    if (commonIdx === 0) return true;

    const charIndexA = commonIdx * (dimensionA / resultGCD);
    const charIndexB = commonIdx * (dimensionB / resultGCD);

    return sequenceA.charCodeAt(charIndexA) === sequenceB.charCodeAt(charIndexB);
  });

  return isAllConsistent ? resultLCM : -1;
};

const executeProgram = (fileIdentifier) => {
  const contentFromDisk = require('fs').readFileSync(fileIdentifier, 'utf8');
  return processSolution(contentFromDisk);
};

console.log(executeProgram("/dev/stdin"));