const acquireModule = globalThis.require;

const obtainSynchronousFileData = (filePath, encodingType) => {
  const fileSystemModule = acquireModule('node:fs');
  return fileSystemModule.readFileSync(filePath, encodingType);
};

const determineMinimum = (firstVal, secondVal) => {
  return firstVal < secondVal ? firstVal : secondVal;
};

const displayOutput = globalThis.console.log;

const rawTextContent = obtainSynchronousFileData('/dev/stdin', 'utf8');

const lineSegments = rawTextContent.trim().split('\n');

const [desiredTotalAmount, distinctCoinCount] = lineSegments[0].split(' ');
const coinDenominationValues = lineSegments[1].trim().split(' ');

const buildStateKey = (...components) => {
  const uniqueStateId = components.join('-');
  return uniqueStateId;
};

const computedResultsCache = new Map();

const checkCacheEntry = (key) => computedResultsCache.has(key);
const retrieveCachedEntry = (key) => computedResultsCache.get(key);
const storeCacheEntry = (key, value) => computedResultsCache.set(key, value);

const calculateFewestCoins = (currentCoinUseCount, targetRemainingValue) => {
  const stateIdentifier = buildStateKey(currentCoinUseCount, targetRemainingValue);
  let finalCalculatedOutcome = 0;

  if (checkCacheEntry(stateIdentifier)) {
    finalCalculatedOutcome = retrieveCachedEntry(stateIdentifier);
  } else if (targetRemainingValue !== 0) {
    const nextIterationCoinCount = currentCoinUseCount + 1;
    let minimalCoinsFound = 50003;

    for (let currentCoinIndex = 0; currentCoinIndex < parseInt(distinctCoinCount, 10); currentCoinIndex++) {
      const valueAfterCoinUse = targetRemainingValue - parseInt(coinDenominationValues[currentCoinIndex], 10);

      if (valueAfterCoinUse < 0) {
        continue;
      }
      const outcomeFromRecursion = calculateFewestCoins(nextIterationCoinCount, valueAfterCoinUse);
      storeCacheEntry(buildStateKey(nextIterationCoinCount, valueAfterCoinUse), outcomeFromRecursion);
      minimalCoinsFound = determineMinimum(minimalCoinsFound, outcomeFromRecursion);
    }
    finalCalculatedOutcome = minimalCoinsFound + 1;
  }

  return finalCalculatedOutcome;
};

displayOutput(calculateFewestCoins(0, parseInt(desiredTotalAmount, 10)));