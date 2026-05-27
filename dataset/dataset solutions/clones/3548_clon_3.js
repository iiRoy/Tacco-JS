function processInputData(rawInputString) {
  const trimmedInput = rawInputString.trim();

  const parsedValues = trimmedInput.split(" ");

  const valueA = Number(parsedValues[0]);
  const valueB = Number(parsedValues[1]);

  const productResult = valueA * valueB;

  const checkParity = (numberToCheck) => {
    return numberToCheck % 2 === 0;
  };

  const isProductEven = checkParity(productResult);

  if (isProductEven) {
    console.log("No");
  } else {
    console.log("Yes");
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
