function processInputData(sourceContent) {
  const trimmedContent = sourceContent.trim();
  const numericComponents = trimmedContent.split(" ").map(Number);

  const uniqueValues = new Set(numericComponents);

  return uniqueValues.size;
}

const executeSolution = (dataSource) => {
  const finalResult = processInputData(dataSource);
  console.log(finalResult);
};

executeSolution(require("fs").readFileSync("/dev/stdin", "utf8"));
