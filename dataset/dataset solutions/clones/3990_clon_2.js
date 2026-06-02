'use strict';

function solve(source) {
  source = source.split('\n')[0].split(' ').map(value => Number(value));

  const height = source[0];
  const width = source[1];

  let result = Math.abs(height - 2) * Math.abs(width - 2);

  if (result > Number.MAX_SAFE_INTEGER) {

    const multiplyLargeNumbers = (leftValue, rightValue) => {
      const leftDigits = String(leftValue).split('').map(value => Number(value)).reverse();
      const rightDigits = String(rightValue).split('').map(value => Number(value)).reverse();

      let productArray = [...Array(leftDigits.length + rightDigits.length)].fill(0);

      const normalizeCarry = () => {
        for (let pos = 0; pos < productArray.length; pos++) {
          if (productArray[pos] >= 10) {
            const carryPart = Number(String(productArray[pos]).split('')[0]);
            const digitPart = Number(String(productArray[pos]).split('')[1]);

            productArray[pos - 1] += carryPart;
            productArray[pos] = digitPart;
          }
        }
      };

      for (let i = 0; i < leftDigits.length; i++) {
        for (let j = 0; j < rightDigits.length; j++) {
          const partialProduct = leftDigits[i] * rightDigits[j];
          const targetIndex = productArray.length - (i + j) - 1;

          productArray[targetIndex] += partialProduct;
          normalizeCarry();
        }
      }

      for (let idx = 0; idx < productArray.length; idx++) {
        if (productArray[idx] !== 0) {
          productArray = productArray.slice(idx);
          break;
        }
      }

      return productArray.join('');
    };

    result = multiplyLargeNumbers(
      Math.abs(height - 2),
      Math.abs(width - 2)
    );
  }

  console.log(result);
}

solve(require("fs").readFileSync("/dev/stdin", "utf8"));