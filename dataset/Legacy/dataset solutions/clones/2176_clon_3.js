function ProcessInput(rawData) {
  const inputLines = rawData.split("\n");
  const elementCountString = inputLines[0];
  let dataElements = inputLines[1].split(" ");

  const compareNumericStrings = (valueA, valueB) => {
    const parsedValueA = parseInt(valueA, 10);
    const parsedValueB = parseInt(valueB, 10);
    return parsedValueA - parsedValueB;
  };

  dataElements.sort(compareNumericStrings);

  const loopUpperLimit = parseInt(elementCountString, 10) - 1;

  for (let currentIdx = 0; currentIdx < loopUpperLimit; currentIdx++) {
    const currentItem = dataElements[currentIdx];
    const nextItem = dataElements[currentIdx + 1];

    if (currentItem === nextItem) {
      console.log("NO");
      return;
    }
  }

  console.log("YES");
}
