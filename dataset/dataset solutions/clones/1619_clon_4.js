function processInput(dataString) {
  const numericValue = Number(dataString);
  const isThirtyOrMore = numericValue >= 30;
  const outcomeMap = new Map();
  outcomeMap.set(true, "YES");
  outcomeMap.set(false, "NO");
  console.log(outcomeMap.get(isThirtyOrMore));
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
