function countTrailingZeros(numVal) {
    const strVal = String(numVal);
    const reversedStr = strVal.split('').reverse().join('');
    const matchResult = reversedStr.match(/^0*/);
    return matchResult ? matchResult[0].length : 0;
}

function processInput(rawInput) {
    const startNum = parseInt(rawInput);
    
    const numberSequence = Array.from(
        { length: Math.floor(startNum / 2) + 1 }, 
        (_, idx) => startNum - idx * 2
    ).filter(val => val > 0);

    const totalZeroCount = numberSequence.reduce((accumulator, currentNum) => {
        return accumulator + countTrailingZeros(currentNum);
    }, 0);

    console.log(totalZeroCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
