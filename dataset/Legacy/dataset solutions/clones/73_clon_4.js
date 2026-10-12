var numericValues = [40, 100, 1, 5, 25, 10];
var collectionSize = numericValues.length;
var exchangeOccurred;

do {
    exchangeOccurred = false;
    for (var currentPosition = 0; currentPosition < collectionSize - 1; currentPosition++) {
        if (numericValues[currentPosition] < numericValues[currentPosition + 1]) {
            var temporaryStorage = numericValues[currentPosition];
            numericValues[currentPosition] = numericValues[currentPosition + 1];
            numericValues[currentPosition + 1] = temporaryStorage;
            exchangeOccurred = true;
        }
    }
} while (exchangeOccurred);

console.log(numericValues);
