process.stdin.setEncoding('utf8');

executeInputProcessor(function * () {
    let inputString = yield;

    let initialDigit = inputString[0];
    let remainingDigitsCount = inputString.length - 1;
    console.log(remainingDigitsCount * 9 + (initialDigit - 1));
});

/**
 * Manages standard input for a generator-based processing routine.
 * This component handles reading data from the console and supplying it
 * to a generator function, allowing the generator to request input using `yield`.
 * @param {GeneratorFunction} processingRoutine The generator function that processes the input.
 */
function executeInputProcessor(processingRoutine) {
    let processorInstance = processingRoutine();
    let currentInputBuffer = null;
    let tokenQueue = [null];

    process.stdin.pause();

    function handleIncomingData(dataBlock) {
        // Halt further stdin reads temporarily.
        process.stdin.pause();
        // Split the received data into individual tokens based on whitespace.
        let parsedTokens = dataBlock.split(/\s+/);
        for (let idx = 0, totalTokens = parsedTokens.length; idx < totalTokens; ++idx) {
            if (parsedTokens[idx]) {
                tokenQueue.push(parsedTokens[idx]);
            }
        }
        processTokens();
    }

    function processTokens() {
        while (0 < tokenQueue.length) {
            let operationResult = processorInstance.next(tokenQueue.shift());
            if (undefined !== operationResult.value) {
                // If the generator produced an output, write it to standard output.
                process.stdout.cork();
                process.stdout.write(operationResult.value);
                process.stdout.uncork();
            }
            // Terminate if the generator function has finished its execution.
            if (operationResult.done) return;
        }

        process.stdin.resume(); // If no more tokens, reactivate stdin to receive new data.
    };

    process.stdin.on('data', handleIncomingData);

    processTokens();
}