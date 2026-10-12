var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var dataRows = rawData.trim().split('\n');

var currentLine;
while (currentLine = dataRows.shift()) {
	if (currentLine == '0')
		break;

	var countOfTwos = 0;
	var countOfFives = 0;
	var numberInput = +currentLine;
	for (var iterator = 1; iterator <= numberInput; iterator++) {
		var tempValue = iterator;
		while (tempValue % 2 == 0) {
			tempValue /= 2;
			countOfTwos++;
		}
		while (tempValue % 5 == 0) {
			tempValue /= 5;
			countOfFives++;
		}
	}
	console.log(Math.min(countOfTwos, countOfFives));
}
