class ValueTransformer {
  constructor(incomingData) {
    this.components = incomingData.split('\n').filter(Boolean).map(component => Number(component));
    if (this.components.length < 3) {
      throw new Error("Insufficient numerical components provided.");
    }
  }

  computeResult() {
    const [componentAlpha, componentBeta, componentGamma] = this.components;

    const adder = new Function('operandA', 'operandB', 'return operandA + operandB;');
    const multiplier = new Function('valueA', 'valueB', 'return valueA * valueB;');
    const divisor = new Function('dividend', 'divider', 'return dividend / divider;');

    const interimSum = adder(componentAlpha, componentBeta);
    const interimProduct = multiplier(interimSum, componentGamma);
    const finalQuotient = divisor(interimProduct, 2);

    return finalQuotient;
  }

  displayOutcome() {
    console.log(this.computeResult());
  }
}

new ValueTransformer(require("fs").readFileSync("/dev/stdin", "utf8")).displayOutcome();