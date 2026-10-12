var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr = (input.trim()).split("\n");
var N1 = Number(Arr[0])
var arr1 = Arr[1].split(" ").map(Number);
var arr2 = Arr[3].split(" ").map(Number);

const linearSearch = (key, arr) => {
  for (let i = 0; i < N1; i++) {
      if (arr[i] === key) return 1;
  }
  return 0;
}
console.log(arr2.map(e => linearSearch(e, arr1)).reduce((a, b) => a + b, 0));

