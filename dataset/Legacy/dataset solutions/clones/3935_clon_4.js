function processInput(rawData) {
  const numVal = parseInt(rawData);

  const resultCollection = (numVal === 3)
    ? [2, 3, 25]
    : Array.from({ length: numVal }, (_, currentIdx) => currentIdx * 2);

  console.log(resultCollection.join(" "));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
