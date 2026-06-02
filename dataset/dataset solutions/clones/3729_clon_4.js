'use strict'

function main(inputString) {
  const requestedCount = Number(inputString.split('\n')[0]);

  const initialValues = [
    ...Array.from({ length: 9 }, (_, index) => String(index + 1)),
    ...Array.from({ length: 9 }, (_, index) => String((index + 1) * 10 + 9)),
    '199'
  ];

  const leadingDigits = Array.from({ length: 18 }, (_, index) => String(index + 2));

  const trailingNinesSeries = Array.from({ length: 21 }, (_, index) => '9'.repeat(index + 2));

  const dynamicallyGeneratedValues = trailingNinesSeries.flatMap(suffixPart =>
    leadingDigits.map(prefixPart => prefixPart + suffixPart)
  );

  const completeSequence = [...initialValues, ...dynamicallyGeneratedValues];

  const outputResult = completeSequence.slice(0, requestedCount).join('\n');
  console.log(outputResult);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
