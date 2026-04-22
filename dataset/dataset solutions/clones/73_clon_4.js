var numericValues = [40, 100, 1, 5, 25, 10];
var collectionLength = numericValues.length;

for (var outerIndex = 0; outerIndex < collectionLength - 1; outerIndex++) {
    var greatestValuePosition = outerIndex;
    for (var innerIndex = outerIndex + 1; innerIndex < collectionLength; innerIndex++) {
        if (numericValues[innerIndex] > numericValues[greatestValuePosition]) {
            greatestValuePosition = innerIndex;
        }
    }
    var temporaryHolding = numericValues[outerIndex];
    numericValues[outerIndex] = numericValues[greatestValuePosition];
    numericValues[greatestValuePosition] = temporaryHolding;
}
console.log(numericValues);