const { count } = require("console");

function main(lines) {
  const [N, M] = na();

  const ans = N*(N-1)/2 + M*(M-1)/2;
  
  return ans;
}



const lines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

let lineCount = 0;
const s = () => lines[lineCount++];
const n = () => Number(s());
const b = () => BigInt(s());
const sa = () => s().split(' ');
const na = () => sa().map(Number);
const ba = () => sa().map(BigInt);

const ans = main(lines);
console.log( ans );