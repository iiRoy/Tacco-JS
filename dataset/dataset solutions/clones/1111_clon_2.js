const SYSTEM_INPUT_PATH = '/dev/stdin';
const TEXT_ENCODING_UTF8 = 'utf8';

const numericOperations = {
    roundDown: function(numericValue) {
        return ~~numericValue;
    }
};

const systemOutput = {
    displayMessage: function(outputString) {
        console.log(outputString);
    }
};

const obtainModule = (moduleIdentifier) => {
    return require(moduleIdentifier);
};

const fileSystemAccess = obtainModule('fs');

systemOutput.displayMessage(
    fileSystemAccess
        .readFileSync(SYSTEM_INPUT_PATH, TEXT_ENCODING_UTF8)
        .trim()
        .split(/[ |\n]/)
        .slice(1)
        .map((itemValue, elementIndex, dataCollection) => {
            let currentUnitNumber = ++elementIndex;
            let unitDescription = `structureUnit ${currentUnitNumber}: itemIdentifier = ${itemValue}, `;

            if (currentUnitNumber > 1) {
                const ancestorIndex = numericOperations.roundDown(currentUnitNumber / 2) - 1;
                unitDescription += `ancestorIdentifier = ${dataCollection[ancestorIndex]}, `;
            }

            const leftChildPotentialIndex = (2 * currentUnitNumber) - 1;
            if (leftChildPotentialIndex < dataCollection.length) {
                unitDescription += `leftChildIdentifier = ${dataCollection[leftChildPotentialIndex]}, `;
            }

            const rightChildPotentialIndex = (2 * currentUnitNumber);
            if (rightChildPotentialIndex < dataCollection.length) {
                unitDescription += `rightChildIdentifier = ${dataCollection[rightChildPotentialIndex]}, `;
            }

            return unitDescription;
        })
        .join('\n')
);