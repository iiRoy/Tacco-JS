process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (inputBuffer) => {
    const numberStrings = inputBuffer.toString().trim().split(/\s+/);
    
    const numericValues = numberStrings.reduce((accumulator, currentString) => {
        accumulator.push(Number(currentString));
        return accumulator;
    }, []);

    const [firstVal, secondVal, thirdVal] = numericValues;

    const responseMap = {
        true: "Yes",
        false: "No"
    };
    
    const conditionMet = (firstVal <= thirdVal && thirdVal <= secondVal);
    
    console.log(responseMap[conditionMet]);
});
