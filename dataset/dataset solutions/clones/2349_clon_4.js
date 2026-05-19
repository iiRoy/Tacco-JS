"use strict";

const processInputAndCalculate = (inputData) => {
    const lines = inputData.trim().split("\n");
    const personCount = parseInt(lines[0]);

    const allStatements = [];
    let currentLinePointer = 1;

    for (let currentPersonIndex = 0; currentPersonIndex < personCount; currentPersonIndex++) {
        const statementsMadeByPerson = parseInt(lines[currentLinePointer]);
        currentLinePointer++;
        const currentPersonStatementList = [];
        for (let statementIterator = 0; statementIterator < statementsMadeByPerson; statementIterator++) {
            const [targetIdentifier, truthValue] = lines[currentLinePointer].split(" ");
            currentPersonStatementList.push({
                target: parseInt(targetIdentifier) - 1,
                type: parseInt(truthValue)
            });
            currentLinePointer++;
        }
        allStatements.push(currentPersonStatementList);
    }

    const declaredDishonestCounts = new Array(personCount).fill(0);
    const declaredHonestCounts = new Array(personCount).fill(0);
    const peopleDeclaringDishonest = new Array(personCount).fill(null).map(() => []);
    const peopleDeclaredDishonestBy = new Array(personCount).fill(null).map(() => []);

    for (let personIdx = 0; personIdx < personCount; personIdx++) {
        for (const currentStatement of allStatements[personIdx]) {
            const targetPersonIdx = currentStatement.target;
            const statementKind = currentStatement.type;

            if (statementKind === 0) {
                declaredDishonestCounts[targetPersonIdx]++;
                peopleDeclaringDishonest[targetPersonIdx].push(personIdx);
                peopleDeclaredDishonestBy[personIdx].push(targetPersonIdx);
            } else {
                declaredHonestCounts[targetPersonIdx]++;
            }
        }
    }

    let firstContradictionSum = 0;
    let mutualDishonestyCount = 0;

    for (let personIdx = 0; personIdx < personCount; personIdx++) {
        if (declaredDishonestCounts[personIdx] >= 1 && declaredHonestCounts[personIdx] >= 1) {
            firstContradictionSum += declaredDishonestCounts[personIdx];
        }
    }

    for (let personIdx = 0; personIdx < personCount; personIdx++) {
        for (const declarerOfDishonesty of peopleDeclaringDishonest[personIdx]) {
            if (peopleDeclaredDishonestBy[personIdx].includes(declarerOfDishonesty)) {
                mutualDishonestyCount++;
            }
        }
    }

    console.log(personCount - (firstContradictionSum + (mutualDishonestyCount / 2)));
};

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
