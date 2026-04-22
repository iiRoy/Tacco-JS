class InputSequenceInterpreter {
    #segments;
    #cursorPosition;

    constructor(sourceText) {
        this.#segments = sourceText.trim().split('\n');
        this.#cursorPosition = 0;
    }

    acquireSingleDatum() {
        if (this.#cursorPosition >= this.#segments.length) {
            return NaN;
        }
        const currentSegment = this.#segments[this.#cursorPosition];
        this.#cursorPosition++;
        return Number(currentSegment.trim());
    }

    acquireDatumVector() {
        if (this.#cursorPosition >= this.#segments.length) {
            return [];
        }
        const currentSegment = this.#segments[this.#cursorPosition];
        this.#cursorPosition++;
        return currentSegment.split(' ').map(Number);
    }
}

const constructOperationPair = (opA, opB) => [`${opA}`, `${opB}`];

const identifyDominantElement = (numericArray) => {
    return numericArray.reduce((currentMaxInfo, elementValue, elementIndex) => {
        if (Math.abs(currentMaxInfo.value) < Math.abs(elementValue)) {
            return { value: elementValue, position: elementIndex + 1 };
        }
        return currentMaxInfo;
    }, { value: numericArray[0], position: 1 });
};

const produceTransformationScript = (totalElements, inputElements) => {
    const dominantInfo = identifyDominantElement(inputElements);
    const dominantValue = dominantInfo.value;
    const dominantPosition = dominantInfo.position;

    if (dominantValue === 0) {
        return "0";
    }

    let scriptLines = [];

    if (dominantValue < 0) {
        scriptLines.push(
            ...constructOperationPair(`${dominantPosition} 1`, `${dominantPosition} 1`)
        );

        const additionalSteps = inputElements.slice(1).flatMap((currentElement, loopIndex) => {
            const effectiveIndex = loopIndex + 2;
            if (currentElement < 0) {
                return constructOperationPair(`1 ${effectiveIndex}`, `1 1`);
            } else {
                return constructOperationPair(`1 1`, `1 ${effectiveIndex}`);
            }
        });
        scriptLines.push(...additionalSteps);

    } else {
        scriptLines.push(
            ...constructOperationPair(`${dominantPosition} ${totalElements}`, `${dominantPosition} ${totalElements}`)
        );

        const additionalSteps = inputElements.slice(0, totalElements - 1).flatMap((currentElement, loopIndex) => {
            const effectiveIndex = loopIndex + 1;
            if (currentElement < 0) {
                return constructOperationPair(`${totalElements} ${totalElements}`, `${totalElements} ${effectiveIndex}`);
            } else {
                return constructOperationPair(`${totalElements} ${effectiveIndex}`, `${totalElements} ${totalElements}`);
            }
        });
        scriptLines.push(...additionalSteps);
    }

    console.log(2 * totalElements);
    return scriptLines.join("\n");
};

const executeProgramFlow = () => {
    const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const sourceReader = new InputSequenceInterpreter(rawInputContent);

    const totalElements = sourceReader.acquireSingleDatum();
    const inputElements = sourceReader.acquireDatumVector();

    return produceTransformationScript(totalElements, inputElements);
};

console.log(executeProgramFlow());