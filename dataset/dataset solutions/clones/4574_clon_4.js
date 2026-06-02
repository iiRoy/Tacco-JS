process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (inputData) {
    const [valOne, valTwo, valThree] = inputData.toString().split(' ').map(Number);
    
    const conditionMet = (Math.max(valOne, valThree) === valThree) && (Math.min(valTwo, valThree) === valThree);
    
    console.log(conditionMet ? "Yes" : "No");
});
