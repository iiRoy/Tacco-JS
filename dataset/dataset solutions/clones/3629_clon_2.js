var bufferedInputStrings = [];
var computedAnswer = 0;
var remainderFrequencyMap;

var inputProcessorUtility = require('readline');

var streamInterface = inputProcessorUtility.createInterface(
 {
    input:  process.stdin,
    output: process.stdout
 }
);


streamInterface.on('line', function (currentDataString)
 {
    bufferedInputStrings.push(currentDataString);
 });


streamInterface.on('close', function ()
 {
    // Retrieve the main numerical parameters from the first input line.
    var primaryCount = parseNumericalElement(bufferedInputStrings[0], 0);
    var moduloDivisor = parseNumericalElement(bufferedInputStrings[0], 1);

    // Convert the second input line into an array of numbers.
    var parsedNumbers = bufferedInputStrings[1].split(" ").map(stringElement => Number(stringElement));

    var prefixRemainderArray = [];
    prefixRemainderArray[0] = 0; // Initialize the first element for cumulative sums.

    // Compute the cumulative sums modulo 'moduloDivisor'.
    // This process helps identify subarrays whose sum is divisible by 'moduloDivisor'.
    for (var loopIterator = 0; loopIterator < primaryCount; loopIterator++)
    {
        prefixRemainderArray[loopIterator + 1] = (prefixRemainderArray[loopIterator] + parsedNumbers[loopIterator]) % moduloDivisor;
    }

    var finalPairCount = 0;
    remainderFrequencyMap = {}; // Initialize the globally declared map here.

    // Iterate through the prefix remainder array to find pairs that yield a sum divisible by 'moduloDivisor'.
    // If two prefix sums have the same remainder, the segment between them sums to a multiple of 'moduloDivisor'.
    for (var loopIterator = 0; loopIterator < prefixRemainderArray.length; loopIterator++)
    {
        var currentModValue = prefixRemainderArray[loopIterator];

        if (remainderFrequencyMap[currentModValue] === undefined)
        {
            remainderFrequencyMap[currentModValue] = 0;
        }

        finalPairCount += remainderFrequencyMap[currentModValue];
        remainderFrequencyMap[currentModValue]++;
    }

    console.log(finalPairCount);
 });


// Utility function to extract a specific numeric value from a space-separated string.
function parseNumericalElement(sourceString, targetIndex)
{
    return ( Number(sourceString.split(" ")[targetIndex]) );
}