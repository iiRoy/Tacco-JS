function ProcessInput(inputString) {
  const stringLength = inputString.length;
  const countP = inputString.match(/p/g).length;
  console.log(Math.floor(stringLength / 2 - countP));
}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
