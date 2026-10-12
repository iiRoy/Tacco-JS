"use strict";
function main(input) {
  const inputs = input.split("\n").filter(x => x !== "");
  const s = inputs[0];

  const result = s
    .split("")
    .map((input, index) => (input === "W" ? index : 0))
    .filter(x => x !== 0)
    .reduce((acc, cur, index) => acc + cur - index);

  console.log(result);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
