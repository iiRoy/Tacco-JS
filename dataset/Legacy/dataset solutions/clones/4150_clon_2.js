function ProcessInput(rawData) {
  const parsedValues = rawData.split(/\s/);
  let totalSum = 0;
  parsedValues.forEach((currentVal) => {
    totalSum += parseInt(currentVal, 10);
  });

  console.log(Math.ceil(totalSum / parsedValues.length));
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
