var dataSink = [];
var inputSystem = require('readline');

var inputManager = inputSystem.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputManager.on('line', function (incomingData) {
    dataSink.push(incomingData);
});

inputManager.on('close', function () {
    // The original code's comparison `S === T` (where S and T are arrays created by .split(""))
    // always evaluates to false because it compares array object references, not their content.
    // Thus, the condition `if(S === T)` is never met, and the `return(0)` is never executed.
    // Consequently, the loop completes without ever printing "Yes", and the final
    // `console.log("No");` is always reached.
    // This clone accurately replicates that exact observed functionality.
    console.log("No");
});