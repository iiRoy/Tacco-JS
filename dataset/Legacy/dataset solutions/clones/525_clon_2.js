var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineArray = rawData.trim().split("\n");

var params = lineArray.shift().split(" ").map(Number);

var firstParam = params[0] - 1;

var secondParam = params[1];

var thirdParam = params[2];

var dataPoints = [];

for (var idx = 0; idx < secondParam; idx++) {
    var currentVal = lineArray.shift() - 0;
    if (currentVal !== thirdParam) {
        dataPoints.push(currentVal);
    }
}

dataPoints = dataPoints.concat(thirdParam);

dataPoints.sort(function(valA, valB) {
    return valA - valB;
});

var minimumValue = Infinity;

dataPoints.forEach(function(currentElement, currentIndex) {
    if (currentElement < thirdParam) {
        if (currentIndex !== 0) {
            minimumValue = Math.min(minimumValue, (thirdParam - currentElement) * 2 + (firstParam - thirdParam + 1) + dataPoints[currentIndex - 1]);
        } else {
            minimumValue = Math.min(minimumValue, (thirdParam - currentElement) * 2 + (firstParam - thirdParam + 1));
        }
    }
    if (thirdParam === currentElement) {
        if (currentIndex === 0) {
            minimumValue = Math.min(minimumValue, dataPoints[dataPoints.length - 1] - currentElement);
        }
        if (currentIndex === dataPoints.length - 1) {
            minimumValue = Math.min(minimumValue, currentElement - dataPoints[0]);
        }
        if (currentIndex !== dataPoints.length - 1) {
            minimumValue = Math.min(minimumValue, thirdParam + firstParam - dataPoints[currentIndex + 1] + 1);
        }
        if (currentIndex !== 0) {
            minimumValue = Math.min(minimumValue, firstParam - thirdParam + 1 + dataPoints[currentIndex - 1]);
        }
    }
    if (thirdParam < currentElement) {
        if (currentIndex !== dataPoints.length - 1) {
            minimumValue = Math.min(minimumValue, (currentElement - thirdParam) * 2 + thirdParam + (firstParam - dataPoints[currentIndex + 1] + 1));
        } else {
            minimumValue = Math.min(minimumValue, (currentElement - thirdParam) * 2 + thirdParam);
        }
    }
});

console.log(minimumValue * 100);
