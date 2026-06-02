const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const parsedRows = fileContent.split('\n');
const [firstVal, secondVal] = parsedRows[0].split(' ').map(Number);

const baseOffset = firstVal - (1 + (1 - (firstVal % 2)));

const resultStrings = Array.from({ length: secondVal }, (_, currentIdx) => {
    const leftComponent = currentIdx + 1;
    const rightComponent = baseOffset - currentIdx;
    return `${leftComponent} ${rightComponent}`;
});

console.log(resultStrings.join('\n'));
