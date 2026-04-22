class NumericPairAnalyzer {
    #initialDatum;
    #componentOne;
    #componentTwo;

    constructor(sourceMaterial) {
        this.#initialDatum = sourceMaterial;
    }

    #extractOperands() {
        const found = this.#initialDatum.match(/(\d+)\s+(\d+)/);
        if (found && found.length >= 3) {
            this.#componentOne = Number(found[1]);
            this.#componentTwo = Number(found[2]);
        } else {
            this.#componentOne = 0;
            this.#componentTwo = 0;
        }
    }

    #computeBinaryCombinations(inputVal) {
        return Math.max(0, inputVal * (inputVal - 1) / 2);
    }

    processAndReport() {
        this.#extractOperands();
        const outcomeA = this.#computeBinaryCombinations(this.#componentOne);
        const outcomeB = this.#computeBinaryCombinations(this.#componentTwo);
        return outcomeA + outcomeB;
    }
}

const applicationEntry = (systemInput) => {
    const analyzerObject = new NumericPairAnalyzer(systemInput);
    const finalResult = analyzerObject.processAndReport();
    console.log(finalResult);
};

applicationEntry(require("fs").readFileSync("/dev/stdin", "utf8"));