function processSequence(inputLines) {
    const currentBase = inputLines[0];

    const baseComplementMapping = {
        'A': 'T',
        'C': 'G',
        'G': 'C',
        'T': 'A'
    };

    const complementaryBase = baseComplementMapping[currentBase];

    console.log(complementaryBase);
}

const fileData = require("fs").readFileSync("/dev/stdin", "utf8");
const dataArray = fileData.split('\n');
processSequence(dataArray);
