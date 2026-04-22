const processInputData = (initialData) => {
    const [primaryLine, secondaryLine] = initialData.split('\n');
    const numericalCount = Number(primaryLine);
    const itemSequence = secondaryLine.split(' ');

    const valueOccurrences = new Map();
    Array.from({ length: numericalCount }, (v, idx) => itemSequence[idx])
        .forEach(item => {
            valueOccurrences.set(item, (valueOccurrences.get(item) || 0) + 1);
        });

    const numbersToVerify = [];
    let currentValForCheck = numericalCount - 1;
    while (currentValForCheck > 0) {
        numbersToVerify.push(String(currentValForCheck));
        currentValForCheck -= 2;
    }

    const checkResult = numbersToVerify.every(key => valueOccurrences.get(key) === 2);

    if (!checkResult) {
        console.log(0);
        return;
    }

    const finalPower = Math.floor(numericalCount / 2);
    console.log(2 ** finalPower);
};

const fileHandler = require('node:fs');
const fileContents = fileHandler.readFileSync('hoge.txt', 'utf8');
processInputData(fileContents);