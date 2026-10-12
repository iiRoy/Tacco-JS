const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const arr = input.split('\n');
let str = "";

for(let i = 0; i < arr.length; i++){
  if(arr[i] === '0') break;
  const num = [...arr[i]].map(Number);
  const sum = num.reduce((acc, curr) => acc + curr);
  str += sum + '\n';
}

console.log(str.trim());
