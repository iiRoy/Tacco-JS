let commence = 0;
let finish = 9;

let dynamicTable = [];

dynamicTable[0] = new Array(1);
dynamicTable[0][0] = 1;

for (let currentDigits = 1; currentDigits <= 4; currentDigits++) {
    dynamicTable[currentDigits] = new Array(currentDigits * finish + 1).fill(0);
    for (let currentSum = 0; currentSum <= currentDigits * finish; currentSum++) {
        for (let digitValue = commence; digitValue <= finish; digitValue++) {
            if (currentSum - digitValue >= 0) {
                dynamicTable[currentDigits][currentSum] += dynamicTable[currentDigits - 1][currentSum - digitValue];
            }
        }
    }
}

const solutionMap = dynamicTable[4];

let inputFlow = process.stdin;

inputFlow.resume();
inputFlow.setEncoding('utf8');

inputFlow.on("data", function(dataPacket) {
    let numerals = String(dataPacket)
        .split("\n")
        .map(val => parseInt(val, 10))
        .filter(entry => !isNaN(entry) && entry >= commence * 4 && entry <= finish * 4);

    let cumulativeTotal = 0;

    for (let entry of numerals) {
        cumulativeTotal += solutionMap[entry];
    }
    console.log(cumulativeTotal);
});