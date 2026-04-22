const obtainPairList = () => nextIntArray();
const renderResult = (val) => myout(val);

function performCalculation() {
  const initialParams = obtainPairList();
  const upperLimit = initialParams[0];
  const constraintCount = initialParams[1];
  const moduloDivisor = 998244353;

  const stateMemo = new Array(upperLimit).fill(null);
  const cumulativeMemo = new Array(upperLimit).fill(null);

  const rangeSpecifications = [];
  for (let cIdx = 0; cIdx < constraintCount; cIdx++) {
    const tempRange = obtainPairList();
    rangeSpecifications.push({
      lowerBound: tempRange[0],
      upperBound: tempRange[1]
    });
  }

  const retrieveStateValue = (currentIdx) => {
    if (currentIdx < 0) return 0;
    if (currentIdx === 0) return 1;
    if (stateMemo[currentIdx] !== null) return stateMemo[currentIdx];

    let accumulatedValue = 0;
    for (const currentSpec of rangeSpecifications) {
      const effectiveStart = currentIdx - currentSpec.lowerBound;
      const effectiveEnd = currentIdx - currentSpec.upperBound;

      if (effectiveStart < 0) {
        continue;
      }

      let segmentContribution = 0;
      if (currentSpec.lowerBound === currentSpec.upperBound) {
        segmentContribution = retrieveStateValue(effectiveStart);
      } else {
        const sumAtStart = retrieveCumulativeSum(effectiveStart);
        const sumBeforeEnd = retrieveCumulativeSum(effectiveEnd - 1);
        segmentContribution = (sumAtStart - sumBeforeEnd + moduloDivisor) % moduloDivisor;
      }
      accumulatedValue = (accumulatedValue + segmentContribution) % moduloDivisor;
    }
    stateMemo[currentIdx] = accumulatedValue;
    return accumulatedValue;
  };

  const retrieveCumulativeSum = (currentIdx) => {
    if (currentIdx < 0) return 0;
    if (currentIdx === 0) return 1;
    if (cumulativeMemo[currentIdx] !== null) return cumulativeMemo[currentIdx];

    const currentCumulative = (retrieveStateValue(currentIdx) + retrieveCumulativeSum(currentIdx - 1)) % moduloDivisor;
    cumulativeMemo[currentIdx] = currentCumulative;
    return currentCumulative;
  };

  retrieveStateValue(upperLimit - 1);
  renderResult(stateMemo[upperLimit - 1]);
}