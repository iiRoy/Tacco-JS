// The entire raw data stream is passed into the 'receivedString' parameter.
function processInput(receivedString) {

    // The incoming string is split by whitespace, and each part is converted to a numerical value.
    let [itemAmount, batchLimit, timePerCycle] = receivedString.split(" ").map(Number);

    // Calculate the total duration required based on the number of items, batch capacity, and time per batch.
    const finalTime = Math.ceil(itemAmount / batchLimit) * timePerCycle;

    // Display the computed total duration to the standard output.
    console.log(finalTime);
}

// Please do not modify the lines below; they handle reading from standard input and invoking the primary processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));