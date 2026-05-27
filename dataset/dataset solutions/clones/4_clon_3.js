function displayMultiplicationEntry(firstFactor, secondFactor) {
    var productResult = firstFactor * secondFactor;
    var outputLine = firstFactor + "x" + secondFactor + "=" + productResult;
    Console.log(outputLine);
}

for (var outerLoopIndex = 1; outerLoopIndex <= 9; outerLoopIndex++) {
    var innerLoopIndex = 0;
    while (innerLoopIndex++ < 9) {
        displayMultiplicationEntry(outerLoopIndex, innerLoopIndex);
    }
}
