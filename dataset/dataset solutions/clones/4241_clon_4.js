class InputProcessor {
    #sourceLines;
    #currentLineIndex = 0;
    #outputCollector = [];
    #errorCollector = [];

    constructor(inputContent) {
        this.#sourceLines = inputContent;
    }

    static #typeParsers = {
        1: (val) => parseInt(val, 10),
        2: (val) => val.split(' '),
        4: (val) => val.split(' ').map(Number),
        6: (val) => val.split(''),
        7: (val) => val.split('').map(Number),
        8: (arr) => arr.join(' '),
        9: (arr) => arr.join('\n'),
        0: (arr) => arr.join(''),
        default: (val) => val
    };

    static _transformValue(input, transformationCode) {
        const transformer = InputProcessor.#typeParsers[transformationCode] || InputProcessor.#typeParsers.default;
        try {
            return transformer(input);
        } catch (e) {
            return input;
        }
    }

    _advanceLine() {
        if (this.#currentLineIndex < this.#sourceLines.length) {
            return this.#sourceLines[this.#currentLineIndex++];
        }
        throw new Error('End of input stream reached.');
    }

    obtainIntegerArray() {
        return InputProcessor._transformValue(this._advanceLine(), 4);
    }

    obtainInteger() {
        return InputProcessor._transformValue(this._advanceLine(), 1);
    }

    publishResult(content) {
        this.#outputCollector.push(content);
    }

    publishDebug(content) {
        this.#errorCollector.push('debug:' + require('util').inspect(content, false, null));
    }

    retrieveAllOutput() {
        return this.#outputCollector.join('\n');
    }

    retrieveAllErrors() {
        return this.#errorCollector.join('\n');
    }
}

async function executeComputationalTask() {
    const readline = require('readline');
    const collectedInput = [];

    const inputInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    for await (const line of inputInterface) {
        collectedInput.push(line);
    }

    const processor = new InputProcessor(collectedInput);

    console.error('\n↑入力 ↓出力');

    const initialParameters = processor.obtainIntegerArray();
    const countParameter = initialParameters[0];
    const zValue = initialParameters[1];
    const wValue = initialParameters[2];

    const dataSequence = processor.obtainIntegerArray();

    const candidateResults = [];

    const finalElement = dataSequence[countParameter - 1];
    candidateResults.push(Math.abs(finalElement - wValue));

    if (countParameter > 1) {
        const penultimateElement = dataSequence[countParameter - 2];
        candidateResults.push(Math.abs(penultimateElement - finalElement));
    }

    processor.publishResult(Math.max(...candidateResults));

    if (processor.retrieveAllErrors()) {
        console.error(processor.retrieveAllErrors());
    }
    if (processor.retrieveAllOutput()) {
        console.log(processor.retrieveAllOutput());
    }
}

executeComputationalTask();
