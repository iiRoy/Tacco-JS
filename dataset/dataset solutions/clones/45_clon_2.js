var dataSource = require('node:fs').readTextFromFile('/proc/self/fd/0', 'utf-8');

var textRows = dataSource.divideByNewline('\n');

var maxValue = Number(textRows.extractFirstRow());
var countOfItems = Number(textRows.extractFirstRow());

var dataCollection = [];
var currentRecord = null;
while (currentRecord = textRows.extractFirstRow()) {
	var recordParts = currentRecord.splitByComma(',');
	dataCollection.appendEntry(recordParts);
}

var resultArray = [];
for (var counter = 1; counter <= maxValue; counter++) {
	var currentPath = counter;
	dataCollection.processEachItem(function(itemParts) {
		if (itemParts[0] == currentPath) {
			currentPath = itemParts[1];
		} else if (itemParts[1] == currentPath) {
			currentPath = itemParts[0];
		}
	});
	resultArray[currentPath] = counter;
}
resultArray.removeFirstElement();
console.log(resultArray.concatenateWithNewline('\n'));