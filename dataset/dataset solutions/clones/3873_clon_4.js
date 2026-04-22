(function(sourceSegments) {
    const [countsAndValues, ...numericalEntries] = sourceSegments;

    const [itemCount, initialMagnitude] = countsAndValues.split(" ").map(Number);

    const relevantNumbers = numericalEntries.slice(0, itemCount).map(Number);

    const totalAccumulated = relevantNumbers.reduce((currentSum, val) => currentSum + val, 0);

    const orderedNumbers = [...relevantNumbers].sort((firstVal, secondVal) => firstVal - secondVal);

    const modifiedMagnitude = initialMagnitude - totalAccumulated;

    const lowestValue = orderedNumbers[0];

    const finalCalculation = itemCount + Math.floor(modifiedMagnitude / lowestValue);

    console.log(finalCalculation);

})(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));