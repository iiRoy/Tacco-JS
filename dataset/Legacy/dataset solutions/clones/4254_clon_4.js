'use strict'

function main(inputStr) {
  const numVal = Number(inputStr);

  const rootVal = Math.floor(Math.sqrt(numVal));

  const finalBase = rootVal - (rootVal * rootVal === numVal ? 1 : 0);

  const result = finalBase * finalBase;

  console.log(result);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
