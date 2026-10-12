const readline = require('readline');

const processData = (inputLine) => {
    const parts = inputLine.split(' ');
    const [firstStr, secondStr, firstNumStr, secondNumStr, thirdStr] = parts;

    const numericValues = [parseInt(firstNumStr, 10), parseInt(secondNumStr, 10)];

    const modificationIndex = (firstStr === thirdStr) ? 0 : 1;
    
    const updatedValues = numericValues.map((val, idx) => 
        idx === modificationIndex ? val - 1 : val
    );

    return updatedValues.join(' ');
};

const inputHandler = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

inputHandler.on('line', (currentLine) => {
    console.log(processData(currentLine));
    inputHandler.close();
});
