function Main(input) {
  const lines = input.split('\n');
  const elementCount = Number(lines[0]);
  const firstRowElements = lines[1].split(' ').map(Number);
  const secondRowElements = lines[2].split(' ').map(Number);

  const prefixSumsFirst = new Array(elementCount + 1).fill(0);
  for (let k = 0; k < elementCount; k++) {
    prefixSumsFirst[k + 1] = prefixSumsFirst[k] + firstRowElements[k];
  }

  const suffixSumsSecond = new Array(elementCount + 1).fill(0);
  for (let k = elementCount - 1; k >= 0; k--) {
    suffixSumsSecond[k] = suffixSumsSecond[k + 1] + secondRowElements[k];
  }

  let currentMax = 0;

  for (let splitIndex = 0; splitIndex < elementCount; splitIndex++) {
    const currentTotal = prefixSumsFirst[splitIndex + 1] + suffixSumsSecond[splitIndex];
    if (currentTotal > currentMax) {
      currentMax = currentTotal;
    }
  }

  console.log('%d', currentMax);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
