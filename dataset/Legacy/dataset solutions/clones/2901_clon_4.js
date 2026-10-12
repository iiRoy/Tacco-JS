function processInput(dataString) {
  const [valOneStr, valTwoStr] = dataString.split(" ");

  const primaryQuantity = Number(valOneStr);
  const secondaryQuantity = Number(valTwoStr);

  const combinedUnits = secondaryQuantity + primaryQuantity * 3;
  const resultValue = Math.floor(combinedUnits / 2);

  console.log(resultValue);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
