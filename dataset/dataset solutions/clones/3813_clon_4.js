var systemReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputLinesCollection = [];
systemReader.on('line', function(singleLineContent){inputLinesCollection.push(singleLineContent);});
systemReader.on('close', function(){
  var operationStartTime = Date.now();
  processInputAndReport(inputLinesCollection);
  var operationDuration = Date.now() - operationStartTime;
  recordEvent('processing duration : ' + operationDuration + 'ms');
  recordEvent('heap memory usage : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

function recordEvent(messageItem) {
  console.error('info:' + require('util').inspect(messageItem, false, null));
}

function displayOutput(valueToPrint) {
    console.log(valueToPrint);
}

function processInputAndReport(sourceInformation) {
    // A function that acts as a stream for parsed integer values from the input array
    function* integerStreamGenerator(linesOfText) {
        let currentPosition = 0;
        while (currentPosition < linesOfText.length) {
            yield parseInt(linesOfText[currentPosition++], 10);
        }
    }

    const numericalValueProducer = integerStreamGenerator(sourceInformation);

    const totalInputItems = numericalValueProducer.next().value; // This is 'N' from the original code

    // A map to store the maximum length of a sequential increasing chain ending at a particular number.
    // For example, {1: 1, 2: 2, 3: 3} indicates a sequence of length 3 ending at 3 has been observed.
    const chainLengthRegistry = new Map();

    // The Array.from({ length: totalInputItems }) creates an array of N undefined items,
    // allowing us to use reduce to iterate N times, processing each subsequent number.
    // The accumulator 'currentMaximumChain' keeps track of the longest chain found so far.
    const ultimateLongestChain = Array.from({ length: totalInputItems })
        .reduce((currentMaximumChain, _, iterationCount) => {
            const currentIncomingValue = numericalValueProducer.next().value; // Get the next number 'a'

            // Determine the length of the chain that would have ended at 'currentIncomingValue - 1'.
            // If 'currentIncomingValue - 1' was not present in our registry, its chain length is 0.
            const lengthOfPredecessorChain = chainLengthRegistry.get(currentIncomingValue - 1) || 0;

            // The length of the new chain ending at 'currentIncomingValue' is 1 plus the length of its predecessor's chain.
            const lengthOfCurrentValueChain = lengthOfPredecessorChain + 1;

            // Update our registry with the newly calculated chain length for 'currentIncomingValue'.
            chainLengthRegistry.set(currentIncomingValue, lengthOfCurrentValueChain);

            // Compare the current maximum chain length with the length of the chain just found,
            // and return the larger of the two.
            return Math.max(currentMaximumChain, lengthOfCurrentValueChain);
        }, 0); // Initialize the maximum chain length to 0

    // The problem asks for the total number of elements minus the length of the longest strictly increasing consecutive subsequence.
    // This value represents the minimum number of elements that must be removed.
    displayOutput(totalInputItems - ultimateLongestChain);
}