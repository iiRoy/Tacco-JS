class DataStream {
    #tokenSequence;
    #currentPosition;

    constructor(sourceText) {
        this.#tokenSequence = sourceText.replace(/\n/g, " ").split(" ");
        this.#currentPosition = 0;
    }

    retrieveString() {
        if (this.#currentPosition >= this.#tokenSequence.length) {
            return undefined;
        }
        return this.#tokenSequence[this.#currentPosition++];
    }

    retrieveInteger() {
        return parseInt(this.retrieveString(), 10);
    }

    retrieveFloat() {
        return parseFloat(this.retrieveString());
    }
}

const characterMapping = Object.freeze({
    'd': 'b',
    'b': 'd',
    'p': 'q'
});

function applyTransformation(symbol) {
    return characterMapping[symbol];
}

const displayResult = (message) => console.log(message);

function executeCoreLogic(sourceContent) {
    const dataReader = new DataStream(sourceContent);
    const targetSequence = dataReader.retrieveString();

    const [firstElement, secondElement, thirdElement, fourthElement] = targetSequence || [];

    const firstComparison = applyTransformation(firstElement) === fourthElement;
    const secondComparison = applyTransformation(secondElement) === thirdElement;

    if (firstComparison && secondComparison) {
        displayResult("Yes");
    } else {
        displayResult("No");
    }
}

function debug() {
    const inputElement = document.getElementById("input");
    if (inputElement) {
        executeCoreLogic(inputElement.value);
    }
}

executeCoreLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
