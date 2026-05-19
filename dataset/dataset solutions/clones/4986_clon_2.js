process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputLines = [];
const lineProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

lineProcessor.on('line', (currentInputLine) => {
  inputLines.push(currentInputLine);
});

lineProcessor.on('close', () => {
    // The split method's argument is preserved as its string representation
    // directly influences the splitting behavior, adhering to Type II rules.
    const [firstNum, secondNum, thirdNum] = inputLines[0].split(v=>v-0);

    // Check if any of the three numbers (implicitly converted from string by modulo operator) are even.
    if (firstNum % 2 === 0 || secondNum % 2 === 0 || thirdNum % 2 === 0) {
        console.log(0);
    } else {
        // If all numbers are odd, calculate and output the minimum product of any two.
        console.log(Math.min(firstNum * secondNum, secondNum * thirdNum, firstNum * thirdNum));
    }
});
