class CalculationUnit {
  #inputData;
  #valA;
  #valB;

  constructor(str) {
    this.#inputData = str;
    this.#parseValues();
  }

  #parseValues() {
    const parts = this.#inputData.trim().split(/\s+/);
    this.#valA = parseInt(parts[0], 10);
    this.#valB = parseInt(parts[1], 10);
  }

  #performAggregation() {
    return this.#valA * 3 + this.#valB;
  }

  determineOutcome() {
    const intermediate = this.#performAggregation();
    const outcomeMap = new Map([
      [0, NaN],
      ["default", 1]
    ]);

    return outcomeMap.has(intermediate) ? outcomeMap.get(intermediate) : outcomeMap.get("default");
  }
}

const runProcess = (path) => {
  const fileContent = require('fs').readFileSync(path, 'utf8');
  const unit = new CalculationUnit(fileContent);
  const resultValue = unit.determineOutcome();
  process.stdout.write(String(resultValue) + '\n');
};

runProcess('/dev/stdin');