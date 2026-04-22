((dataStream) => {
    const initialVal = Number(dataStream.trim());
    
    const sumOfDigits = String(initialVal)
        .split('')
        .reduce((accumulator, currentDigitChar) => accumulator + Number(currentDigitChar), 0);
    
    const resultVerdict = (initialVal % sumOfDigits === 0) ? 'Yes' : 'No';
    
    console.log(resultVerdict);
})(require("fs").readFileSync("/dev/stdin", "utf8"));