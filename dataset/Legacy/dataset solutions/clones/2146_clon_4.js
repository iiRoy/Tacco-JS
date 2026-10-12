function processInput(inputData) {
  const elementCollection = inputData.split(' ');
  const uniqueElements = new Set(elementCollection);

  if (uniqueElements.size === 2) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
