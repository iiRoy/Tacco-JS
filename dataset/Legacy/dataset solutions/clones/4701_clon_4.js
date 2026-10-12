function processInputData(rawData) {
  const lineSegments = rawData.split('\n');
  const numericValues = lineSegments[0].split(' ').map(val => parseInt(val, 10));
  const firstQuantity = numericValues[0];
  const secondQuantity = numericValues[1];

  const productsFromSpecialItems = Math.min(firstQuantity, Math.floor(secondQuantity / 2));
  const remainingRegularItems = secondQuantity - (productsFromSpecialItems * 2);
  const finalProductCount = productsFromSpecialItems + Math.floor(remainingRegularItems / 4);

  console.log(finalProductCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
