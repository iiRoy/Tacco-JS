const sourceText = require("fs").readFileSync("/dev/stdin", "utf8");

let leastDeviation = Infinity;

for (let position = 0; position <= sourceText.length - 3; position++) {
    const segment = sourceText.slice(position, position + 3);
    const numericalValue = parseInt(segment, 10) | 0;
    const currentDeviation = Math.abs(753 - numericalValue);
    
    if (currentDeviation < leastDeviation) {
        leastDeviation = currentDeviation;
    }
}

leastDeviation;
