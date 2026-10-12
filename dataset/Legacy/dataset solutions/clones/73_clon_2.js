let numericalElements = [40, 100, 1, 5, 25, 10];

numericalElements.sort(function(firstValue, secondValue) {
    return secondValue - firstValue;
});

console.log(numericalElements);
