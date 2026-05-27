process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = '';

process.stdin.on('data', (chunk) => {
    inputBuffer += chunk;
});

process.stdin.on('end', () => {
    const processedLine = inputBuffer.trim();

    const valueContainer = new Array(3);
    valueContainer[0] = processedLine;
    const [firstVal, secondVal, thirdVal] = valueContainer;

    const checkParity = (val) => (val % 2 === 0);

    const finalResult = checkParity(firstVal) ? 0 : Math.min(firstVal * secondVal, secondVal * thirdVal, firstVal * thirdVal);

    console.log(finalResult);
});
