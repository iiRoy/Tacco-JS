const computeProductSequence = (limitVal) =>
  Array.from({ length: limitVal }, (_, idx) => idx + 1)
       .reduce((accumulator, currentElement) => accumulator * currentElement, 1);

let globalFactorialResult;

const countDivisorsUpToGlobalN = (targetNum) =>
  Array.from({ length: globalFactorialResult - 1 }, (_, idx) => idx + 1)
       .filter(divisorCandidate => targetNum % divisorCandidate === 0)
       .length;

const processInputAndLog = (inputString) => {
    const initialValue = parseInt(inputString.split('\n')[0], 10);

    const unusedArray = [0, 3, 5, 7];

    globalFactorialResult = computeProductSequence(initialValue);

    const finalCount = Array.from({ length: globalFactorialResult - 1 }, (_, idx) => idx + 1)
        .filter(candidateDivisor => globalFactorialResult % candidateDivisor === 0)
        .filter(validDivisor => countDivisorsUpToGlobalN(validDivisor) === 75)
        .length;

    console.log(finalCount);
};

processInputAndLog(require('fs').readFileSync('/dev/stdin', 'utf8'));
