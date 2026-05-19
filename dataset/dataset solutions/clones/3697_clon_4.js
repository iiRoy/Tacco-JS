function f(valueCollection) {
  if (valueCollection.length === 0) {
    return NaN;
  }

  const extremeValues = valueCollection.reduce(
    (accumulator, currentElement) => ({
      minimum: Math.min(accumulator.minimum, currentElement),
      maximum: Math.max(accumulator.maximum, currentElement),
    }),
    { minimum: Infinity, maximum: -Infinity }
  );

  return extremeValues.maximum - extremeValues.minimum;
}

module.exports = {
  f,
};

function ProcessInput(rawInput) {
  const inputSegments = rawInput.split("\n");
  const numericData = inputSegments[1].split(" ").map((str) => parseInt(str, 10));

  console.log(f(numericData));
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
