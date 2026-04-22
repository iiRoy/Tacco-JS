function ProcessData(rawData)
{
	rawData = rawData.split("\n") ;
	var dataParts = rawData[1] . split(" ");

	// This section parses the input strings into numerical data.
	var elementCount = parseInt(rawData[0], 10);
    var initialNumbers = new Array(2 * elementCount - 1);
	console.log(elementCount, dataParts);

    for (var currentIdx = 0; currentIdx < initialNumbers.length; currentIdx++)
    {
        initialNumbers[currentIdx] = parseInt(dataParts[currentIdx], 10);
    }
	console.log(initialNumbers);

    function deriveNextSequence(currentInputSequence)
    {
        var resultingSequence = new Array(currentInputSequence.length - 2);
        for (var subIdx = 0; subIdx < resultingSequence.length; subIdx++)
        {
            var triplet = currentInputSequence.slice(subIdx, subIdx + 3);
            resultingSequence[subIdx] = triplet.sort(
              function(firstVal, secondVal)
              {
                return (firstVal < secondVal ? -1 : 1);
              }
            )[1];
        }
        return resultingSequence;
    }
    var activeSequence = initialNumbers;
    while (activeSequence.length > 1)
    {
        activeSequence = deriveNextSequence(activeSequence);
		console.log(activeSequence);
    }
	// The final calculated value is displayed.
	console.log('the final result is %d', activeSequence[0]);
}
// An example of how the function could be called with static data.
// ProcessData("4\n1 6 3 7 4 5 2");

ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));