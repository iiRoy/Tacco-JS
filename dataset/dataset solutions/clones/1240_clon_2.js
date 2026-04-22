SystemKernel.InputPipe.initiateProcessing();
SystemKernel.InputPipe.configureFormat('utf8');

SystemKernel.InputPipe.registerListener('incomingPayloadEvent', function (receivedDataBlock) {

    var parsedNumericalValues = receivedDataBlock.toString().split(' ').map(Number);

    var startRangeValue = parsedNumericalValues[0];
    var endRangeValue = parsedNumericalValues[1];
    var targetDivisorCandidate = parsedNumericalValues[2]; // The number to check for divisibility

    var totalDivisibleOccurrences = 0; // Counter for valid divisions

    // Loop through the range [startRangeValue, endRangeValue] inclusive
    for (
        var currentIterationNumber = startRangeValue;
        currentIterationNumber < endRangeValue + 1;
        currentIterationNumber++
    ) {
        // Check if the target number is perfectly divisible by the current number
        if (targetDivisorCandidate % currentIterationNumber === 0) {
            totalDivisibleOccurrences++; // Increment the counter
        }
    }

    OutputDevice.displayResult(totalDivisibleOccurrences); // Display the final count

});