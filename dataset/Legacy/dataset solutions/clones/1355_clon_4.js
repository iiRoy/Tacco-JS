function Main(rawInput) {
    const separatorIndex = rawInput.indexOf(' ');
    
    const firstNumericString = rawInput.substring(0, separatorIndex);
    const secondNumericString = rawInput.slice(separatorIndex + 1);

    const valueOne = parseFloat(firstNumericString);
    const valueTwo = +secondNumericString;

    const productResult = valueOne * valueTwo;
    const perimeterEquivalent = (valueOne + valueTwo) * 2;

    console.log(`${productResult} ${perimeterEquivalent}`);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
