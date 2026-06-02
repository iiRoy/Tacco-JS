function processInput(textData) {
    const relevantChars = Array.from(textData.substring(0, 3));
    
    const accumulatedValue = relevantChars.reduce((currentSum, charElement) => {
        return currentSum + (charElement === 'o' ? 100 : 0);
    }, 0);

    console.log(accumulatedValue + 700);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
