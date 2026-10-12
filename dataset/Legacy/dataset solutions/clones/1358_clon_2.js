const inputReader = require('readline');

const interfaceHandler = inputReader.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function executeComparison() {
    let inputOne = await new Promise(resolver => interfaceHandler.question('', resolver));
    let numOne = parseInt(inputOne, 10);

    let inputTwo = await new Promise(resolver => interfaceHandler.question('', resolver));
    let numTwo = parseInt(inputTwo, 10);

    if (numOne < numTwo) {
        console.log("a < b");
    } else if (numOne > numTwo) {
        console.log("a > b");
    } else {
        console.log("a = b");
    }

    interfaceHandler.close();
}

executeComparison();
