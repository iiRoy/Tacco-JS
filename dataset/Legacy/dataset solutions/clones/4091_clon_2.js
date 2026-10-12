let inputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let inputBuffer = [];
inputHandler.on('line', (incomingLine) => {
    inputBuffer.push(incomingLine);
});

inputHandler.on('close', () => {
    // Process the first line of input
    let currentLine = inputBuffer[0];
    // Split the line by spaces to get individual components
    let parts = currentLine.split(' ');
    // Extract the second and third components as numerical values
    let valA = parts[1];
    let valB = parts[2];
    // Calculate a derived difference value
    let diffVal = valB - valA - 1;
    // Determine the winner based on the parity of the difference
    if (diffVal % 2 === 1) {
        console.log('Alice');
    } else if (diffVal % 2 === 0) {
        console.log('borys');
    }
});
