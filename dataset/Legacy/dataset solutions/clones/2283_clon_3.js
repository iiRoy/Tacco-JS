"use strict"
function executeProgram(inputString) {
    const trimmedInputContent = inputString.trim();
    const parsedLines = trimmedInputContent.split("\n");

    let initialElementsP = parsedLines[1].split(" ");
    let initialElementsQ = parsedLines[2].split(" ");

    const targetPermutationLength = initialElementsP.length;

    let allGeneratedPermutations = generatePermutations(initialElementsP, targetPermutationLength);

    const stringifiedP = initialElementsP.join("");
    const stringifiedQ = initialElementsQ.join("");

    const stringifiedPermutationList = allGeneratedPermutations.map(singlePerm => singlePerm.join(""));

    stringifiedPermutationList.sort();

    const indexForP = stringifiedPermutationList.indexOf(stringifiedP);
    const indexForQ = stringifiedPermutationList.indexOf(stringifiedQ);

    console.log(Math.abs(indexForP - indexForQ));
}

function generatePermutations(elements, lengthOfPermutation) {
    let collectedPermutations = [];

    if (elements.length < lengthOfPermutation) {
        return [];
    }

    if (lengthOfPermutation === 1) {
        return elements.map(element => [element]);
    } else {
        for (let currentElementIndex = 0; currentElementIndex < elements.length; currentElementIndex++) {
            const selectedElement = elements[currentElementIndex];

            const remainingElementsForRecursion = elements.slice(0, currentElementIndex).concat(elements.slice(currentElementIndex + 1));

            const subPermutations = generatePermutations(remainingElementsForRecursion, lengthOfPermutation - 1);

            subPermutations.forEach(subPerm => {
                collectedPermutations.push([selectedElement, ...subPerm]);
            });
        }
    }
    return collectedPermutations;
}

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
