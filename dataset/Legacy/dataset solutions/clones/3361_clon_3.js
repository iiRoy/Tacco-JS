function processInput(inputStr) {
    var lines = inputStr.split("\n");

    var firstLineParts = lines[0].split(" ");
    var limitVal = parseInt(firstLineParts[0]);
    var iterCount = parseInt(firstLineParts[1]);

    lines.shift();
    var dataPoints = lines;

    var currentPos = 0;
    var accumulatedSum = 0;

    const getLastIndex = (arr) => arr.length - 1;

    const parseElement = (arr, index) => parseInt(arr[index]);

    for (var idx = 0; idx < iterCount; idx++) {
        var firstVal = parseElement(dataPoints, 0);
        var lastVal = parseElement(dataPoints, getLastIndex(dataPoints));

        var distA = firstVal - currentPos;
        const remainingLimit = limitVal - lastVal;
        var distB = remainingLimit + currentPos;

        console.log("now:" + currentPos);
        console.log("total:" + accumulatedSum);

        if (distA > distB) {
            accumulatedSum += distA;
            dataPoints.shift();
            currentPos = firstVal;
        } else {
            accumulatedSum += distB;
            dataPoints.pop();
            currentPos = lastVal;
        }
    }

    console.log(accumulatedSum);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
