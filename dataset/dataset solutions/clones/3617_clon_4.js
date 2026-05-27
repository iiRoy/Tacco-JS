function processData(sourceContent) {
  const numericComponents = [0, 1, 2];
  const targetIndex = 1;
  const finalResult = numericComponents.filter(val => val === targetIndex).length;
  console.log(finalResult);
}
processData(require("fs").readFileSync("/dev/stdin", "utf8"));
