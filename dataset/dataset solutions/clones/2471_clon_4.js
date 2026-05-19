function Main(input) {
  const sourceData = input.split("\n");
  const numericValue = parseInt(sourceData[0], 10);

  const permissibleProducts = new Set();

  for (let multiplierA = 1; multiplierA <= 9; multiplierA++) {
    for (let multiplierB = 0; multiplierB <= 9; multiplierB++) {
      permissibleProducts.add(multiplierA * multiplierB);
    }
  }

  if (permissibleProducts.has(numericValue)) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
