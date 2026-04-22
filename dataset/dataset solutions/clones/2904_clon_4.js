class CalculationEngine {
  #alphaValue;
  #betaValue;
  #computedResult;

  constructor(inputSignal) {
    this.#extractComponents(inputSignal);
    this.#performTransformation();
  }

  #extractComponents(dataStream) {
    let tempNumBuffer = '';
    let firstFound = false;
    let dataPointer = 0;

    while (dataPointer < dataStream.length) {
      const symbol = dataStream[dataPointer];
      if (symbol >= '0' && symbol <= '9') {
        tempNumBuffer += symbol;
      } else if (tempNumBuffer !== '') {
        if (!firstFound) {
          this.#alphaValue = parseInt(tempNumBuffer, 10);
          firstFound = true;
        } else {
          this.#betaValue = parseInt(tempNumBuffer, 10);
          break;
        }
        tempNumBuffer = '';
      }
      dataPointer++;
    }
  }

  #performTransformation() {
    this.#computedResult = ((this.#alphaValue * 3) + this.#betaValue) >> 1;
  }

  getFinalOutput() {
    return this.#computedResult;
  }
}

(() => {
  const resourceReader = require("fs").readFileSync("/dev/stdin", "utf8");
  const rawContent = resourceReader.toString();

  const processorInstance = new CalculationEngine(rawContent);
  console.log(processorInstance.getFinalOutput());
})();