function ProcessInput(rawData) {
  const inputLines = rawData.split("\n");

  const inputLineCountStr = inputLines[0]; 

  let stringNumbers = inputLines[1].split(" ");

  stringNumbers.sort((valA, valB) => {
    const numA = parseInt(valA, 10);
    const numB = parseInt(valB, 10);
    return numA - numB;
  });

  const uniqueStringElements = Array.from(new Set(stringNumbers));

  const countOfUniqueElements = uniqueStringElements.length;
  let resultCount;

  resultCount = (countOfUniqueElements % 2 !== 0) ? countOfUniqueElements : countOfUniqueElements - 1;

  console.log(resultCount);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
