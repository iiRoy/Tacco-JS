const { Transform: FlowTransformer } = require('stream');

function elevate(baseVal, expVal) {
  if (expVal === 0) {
    return 1;
  }
  if (expVal < 0) {
    return 1 / elevate(baseVal, -expVal);
  }
  if (expVal % 2 === 0) {
    const half = elevate(baseVal, expVal / 2);
    return half * half;
  }
  return baseVal * elevate(baseVal, expVal - 1);
}

class NumericMultiplier extends FlowTransformer {
  constructor(opts) {
    super(opts);
  }

  _transform(segment, encodingIndicator, completionCallback) {
    const datum = Number(segment);
    const product = elevate(datum, 3);
    this.push(String(product) + '\n');
    completionCallback();
  }
}

process.stdin.resume();

const calculationPipeline = new NumericMultiplier();

process.stdin.pipe(calculationPipeline).pipe(process.stdout);