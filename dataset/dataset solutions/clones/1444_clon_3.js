var fileSystem = require('fs');
var rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

var trimmedData = rawData.trim();
var stringNumbers = trimmedData.split(" ");
var numArray = stringNumbers.map(Number);

var valA = numArray[0];
var valB = numArray[1];
var angleC = numArray[2];

const DEG_TO_RAD_FACTOR = Math.PI / 180;
var angleC_radians = angleC * DEG_TO_RAD_FACTOR;

var productAB = valA * valB;
var halfProductAB = productAB / 2;
var sinAngleC = Math.sin(angleC_radians);
var areaVal = halfProductAB * sinAngleC;

var valASquared = valA * valA;
var valBSquared = valB * valB;
var sumOfSquares = valASquared + valBSquared;

var twoAB = 2 * valA * valB;
var cosAngleC = Math.cos(angleC_radians);
var termToSubtract = twoAB * cosAngleC;

var insideSqrt = sumOfSquares - termToSubtract;
var sideCVal = Math.sqrt(insideSqrt);

var doubleArea = 2 * areaVal;
var heightVal = doubleArea / valA;

var formattedArea = areaVal.toFixed(8);
var perimeter = valA + valB + sideCVal;
var formattedPerimeter = perimeter.toFixed(8);
var formattedHeight = heightVal.toFixed(8);

console.log(formattedArea + " " + formattedPerimeter + " " + formattedHeight);
