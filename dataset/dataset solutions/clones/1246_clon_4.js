const inputRadius = Number(require('fs').readFileSync('/dev/stdin', 'ascii'));

const metricGenerators = [
  (rad) => Math.PI * Math.pow(rad, 2),
  (rad) => 2 * Math.PI * rad
];

const rawMetrics = metricGenerators.map(calcFn => calcFn(inputRadius));

const formattedMetrics = rawMetrics.map(val => val.toFixed(6));

console.log(formattedMetrics.join(' '));
