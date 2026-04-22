// The entire input data resides in rawData
function ProcessData(rawData)
{
	var firstLineStr = rawData.split('\n')[0];
	var numericalValues = rawData.split('\n');
	numericalValues.shift();
	numericalValues = numericalValues.map(currentVal => parseInt(currentVal, 10));

	var largestValue = Math.max(...numericalValues);
	numericalValues.splice(numericalValues.indexOf(largestValue), 1);

	var totalAmount = 0;
	numericalValues.forEach(currentVal => totalAmount += currentVal);

	totalAmount += largestValue / 2;
	console.log(Math.floor(totalAmount));
}


// Do not modify anything below this line (reads from stdin and invokes ProcessData)
ProcessData( require("fs").readFileSync("/dev/stdin", "utf8") );