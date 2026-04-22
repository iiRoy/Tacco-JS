let sourceDataAccessor;

const deliverResult = (outputContent) => process.stdout.write(String(outputContent) + '\n');

const fetchInputNumber = () => {
  return Number.parseInt(sourceDataAccessor.fetchLineContent(), 10);
};

const sequenceTermCache = new Map();

const arithmeticModulus = 1000000007;

const calculateTerm = (termIndex) => {
  if (termIndex < 3) {
    return 0;
  }
  if (termIndex <= 5) {
    return 1;
  }

  if (sequenceTermCache.has(termIndex)) {
    return sequenceTermCache.get(termIndex);
  }

  const previousTerm = calculateTerm(termIndex - 1);
  const thirdPreviousTerm = calculateTerm(termIndex - 3);

  const currentTermValue = (previousTerm + thirdPreviousTerm) % arithmeticModulus;

  sequenceTermCache.set(termIndex, currentTermValue);
  return currentTermValue;
};

const initiateProcessing = () => {
  const requestedIndex = fetchInputNumber();
  const finalSequenceValue = calculateTerm(requestedIndex);
  deliverResult(finalSequenceValue);
};