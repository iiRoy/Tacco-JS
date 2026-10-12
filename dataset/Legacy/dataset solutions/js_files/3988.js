const fs = require('fs');
const input = fs.readFileSync("/dev/stdin", "utf8");
const range = input.toString().split(" ");
const min = parseInt(range[0]);
const max = parseInt(range[1]);
let result = 0;
for(let i = min; i < max; i++) {
  const s = i.toString();
  if(s[0] == s[4] && s[1] == s[3]) result++;
}
console.log(result);