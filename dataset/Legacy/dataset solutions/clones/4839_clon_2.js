var inputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

var inputData = []; // Collection for received text lines

inputHandler.on('line', function (currentLine) {
    inputData.push(currentLine);
});

inputHandler.on('close', function () {
    // Process the first line of input to extract numerical parameters
    var firstLineParts = inputData[0].split(" ");

    var firstNum = Number(firstLineParts[0]);
    var secondNum = Number(firstLineParts[1]);
    var divisorVal = Number(firstLineParts[2]);

    // Calculate an initial value based on the given numbers
    var resultVal = secondNum / divisorVal - firstNum / divisorVal;

    // Apply a conditional adjustment to the calculated value
    if (firstNum % divisorVal === 0) {
        resultVal = resultVal + 1;
    }

    // Display the final computed result to standard output
    console.log(resultVal);
});
