const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

const dataSegments = rawData.split('\n');
const [firstVal, secondVal] = dataSegments[0].split(' ').map(Number);

const initialEven = firstVal & ~1;

const outputLines = Array.from({ length: secondVal }, (_, currentIdx) => {
    const firstComponent = currentIdx + 1;
    const secondComponent = initialEven - currentIdx;
    return `${firstComponent} ${secondComponent}`;
});

console.log(outputLines.join('\n'));
