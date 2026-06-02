'use strict';

const obtainStreamContent = () => new Promise(resolve => {
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  let accumulatedSegments = '';
  process.stdin.on('data', segment => {
    accumulatedSegments += segment;
  });
  process.stdin.on('end', () => {
    resolve(accumulatedSegments);
  });
});

(async () => {
  const receivedString = await obtainStreamContent();
  const numericInput = Number(receivedString);

  const integerHalf = Math.floor(numericInput / 2);

  // The original code attempts to use an undeclared variable 'number',
  // which results in a ReferenceError. This behavior is preserved.
  const firstComponent = integerHalf * integerHalf;
  const secondComponent = integerHalf * (number % 2); // This line will trigger the ReferenceError

  console.log(firstComponent + secondComponent);
})();
