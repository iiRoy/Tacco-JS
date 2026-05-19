var firstFactor, secondFactor;
const loopLimit = 9;

for (firstFactor = 1; firstFactor <= loopLimit; firstFactor++) {
    for (secondFactor = 1; secondFactor <= loopLimit; secondFactor++) {
        var productValue = firstFactor * secondFactor;
        const multiplicationOperator = "x";
        const assignmentOperator = "=";
        var firstPart = firstFactor + multiplicationOperator + secondFactor;
        var finalOutputString = firstPart + assignmentOperator + productValue;
        console.log(finalOutputString);
    }
}
