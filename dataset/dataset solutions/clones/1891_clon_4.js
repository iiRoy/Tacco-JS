function processInput(sourceData) {
  const responseLookup = new Map([
    ['B', 'ARC'],
    ['R', 'ABC']
  ]);

  const outputValue = responseLookup.get(sourceData[1]);

  if (outputValue !== undefined) {
    console.log(outputValue);
  }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
