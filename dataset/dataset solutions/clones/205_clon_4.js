class ProcessUnit {
    constructor() {
        this.accumulatedValues = [];
    }

    evaluateSegment(inputDatum) {
        if (inputDatum.length === 0) {
            return 0;
        }

        const charComponents = Array.from(inputDatum);
        const sortedComponents = [...charComponents].sort();
        const reverseSortedComponents = [...sortedComponents].reverse();

        const sortedStringRepresentation = sortedComponents.join('');
        const reverseSortedStringRepresentation = reverseSortedComponents.join('');

        const getNumericalInterpretation = (textualInput) => {
            return textualInput === '' ? 0 : Number(textualInput);
        };

        const val1 = getNumericalInterpretation(reverseSortedStringRepresentation);
        const val2 = getNumericalInterpretation(sortedStringRepresentation);

        return val1 - val2;
    }

    ingestSource(sourceDescriptor) {
        const fileAccessModule = require('node:fs');
        const contentPayload = fileAccessModule.readFileSync(sourceDescriptor, 'utf8');

        const allTokens = contentPayload.split(/\s/);

        let tokenIndex = 0;
        while (tokenIndex < allTokens.length) {
            const currentToken = allTokens[tokenIndex];
            if (tokenIndex > 0) {
                this.accumulatedValues.push(this.evaluateSegment(currentToken));
            }
            tokenIndex++;
        }
    }

    renderOutput() {
        this.accumulatedValues.forEach(resultItem => console.log(resultItem));
    }
}

const computationEngine = new ProcessUnit();
computationEngine.ingestSource(0);
computationEngine.renderOutput();