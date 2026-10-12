process.stdin.setEncoding('utf-8');
process.stdin.on('data', function (inputStr) {
  const upperBoundary = Number(inputStr);

  const computedTotal = Array.from({ length: upperBoundary }, (_, currentIdx) => currentIdx + 1)
    .filter(valueElement => valueElement % 3 !== 0 && valueElement % 5 !== 0)
    .reduce((runningTotal, itemValue) => runningTotal + itemValue, 0);

  console.log(computedTotal);
});
