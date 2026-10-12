let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the incoming data stream
let [firstNum, secondNum, thirdNum, fourthNum] = rawData.trim().split(" ").map(Number);

if ( ( (firstNum * secondNum) % 2 !== 0 ) && ( (firstNum + secondNum) % 2 !== 0 ) ) {
    console.log("No");
} else {
    console.log("Yes");
}
