const geneticCodeMap = {
    'A': 'T',
    'C': 'G',
    'G': 'C',
    'T': 'A'
};

const dataBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
const lineSegments = dataBuffer.split('\n');
const primaryCharacter = lineSegments[0];

const complementaryBase = geneticCodeMap[primaryCharacter];
process.stdout.write(complementaryBase + '\n');