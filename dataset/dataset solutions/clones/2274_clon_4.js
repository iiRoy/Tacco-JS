const fileSystemModule = require("fs");
const systemInputLocation = "/dev/stdin";

const unparsedData = fileSystemModule.readFileSync(systemInputLocation, "utf8");

const numericalComponents = unparsedData.match(/\d+/g);

const primaryOperand = parseInt(numericalComponents[0], 10);
const comparisonThreshold = parseInt(numericalComponents[1], 10);

// Calculate primaryOperand * 500 using bitwise shifts
// 500 in binary is 111110100
// 500 = 2^8 + 2^7 + 2^6 + 2^5 + 2^4 + 2^2
// 500 = 256 + 128 + 64 + 32 + 16 + 4
const derivedValue = (primaryOperand << 8) +
                     (primaryOperand << 7) +
                     (primaryOperand << 6) +
                     (primaryOperand << 5) +
                     (primaryOperand << 4) +
                     (primaryOperand << 2);

let outcomeMessage;
if (derivedValue >= comparisonThreshold) {
    outcomeMessage = "Affirmative";
} else {
    outcomeMessage = "Negative";
}

process.stdout.write(outcomeMessage + "\n");