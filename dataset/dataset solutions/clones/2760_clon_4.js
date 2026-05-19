"use strict";

const performComputation = (inputPayload) => {
  const numericalElements = inputPayload.split(" ").reduce((collection, item) => {
    collection.push(Number(item));
    return collection;
  }, []);

  const [factorOne, factorTwo, limitValue] = numericalElements;

  const derivedProduct = factorOne * factorTwo;
  const finalOutput = Math.min(derivedProduct, limitValue);

  console.log(finalOutput);
};

performComputation(require('fs').readFileSync('/dev/stdin', 'utf8'));
