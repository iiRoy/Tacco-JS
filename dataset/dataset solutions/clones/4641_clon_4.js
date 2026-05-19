process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (inputPayload) {
    const numericValues = inputPayload.toString().split(' ').map(Number);
    const firstElement = numericValues[0];
    const secondElement = numericValues[1];
    const thirdElement = numericValues[2];

    const outcome = (firstElement + thirdElement === 2 * secondElement) ? "YES" : "NO";
    
    console.log(outcome);
});
