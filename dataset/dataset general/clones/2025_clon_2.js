var netClient = require('./index.js');
var AsyncSeries = require('step');


var iterationCount = 0;

var cycleTimer = undefined;


var requestsSent = 0;
var responsesReceived = 0;


function executeCycle() {
    // Check if the maximum number of iterations has been reached
    if (iterationCount > 100) {
        clearInterval(cycleTimer); // Stop the periodic execution
        console.log('Operation complete.');
        console.log('Summary:', requestsSent, 'initiated ->', responsesReceived, 'finalized');
        return;
    }

    // Log current cycle status
    console.log('Executing cycle:', iterationCount);
    iterationCount++; // Increment the global counter


    AsyncSeries(
        function () {
            // Initiate multiple parallel network connections within this step
            for (var loopIndex = 0; loopIndex < 100; ++loopIndex) {
                netClient.connect(5556, 'localhost', function (remotePeer, networkConnection) {
                    requestsSent++; // Mark a request as initiated
                    remotePeer.sumNumbers(1, 2, function (sumResult) {
                        // Validate the arithmetic result
                        if (sumResult !== 3) {
                            console.log('CRITICAL ERROR! Unexpected sum:', sumResult);
                        }

                        // Proceed to fetch another resource from the remote
                        remotePeer.fetchDocument(function (documentContent) {
                            var contentByteLength = JSON.stringify(documentContent).length;

                            // Check the size of the fetched document
                            if (97143 !== contentByteLength) {
                                console.log('Length mismatch:', contentByteLength, 'Expected 97143. ALERT!');
                            }
                            responsesReceived++; // Mark a response as received

                            // If all initiated requests have been finalized
                            if (responsesReceived === requestsSent) {
                                console.log('Intermediate summary:', requestsSent, 'initiated ->', responsesReceived, 'finalized');
                            }

                            // Clean up the network connection
                            networkConnection.destroy();
                            networkConnection.end();
                        });
                    });
                });
            }
        });
}

// Start the periodic execution of the main cycle
cycleTimer = setInterval(executeCycle, 1000);