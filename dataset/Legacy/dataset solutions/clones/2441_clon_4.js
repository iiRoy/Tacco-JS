function computeResult(numVal) {
  console.log(Math.floor(numVal / 2) - (1 - (numVal % 2)));
}

const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
const numericValue = parseInt(rawInputContent.trim(), 10);

computeResult(numericValue);
