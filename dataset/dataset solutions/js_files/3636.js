// parameter "input" gets all data
function Main(input) {
  var r = parseInt(input, 10);
  var result = 'AGC';

  if (r < 1200) {
    result = 'ABC';
  } else if (r < 2800) {
    result = 'ARC'
  }

  console.log(result);
}
// Don't edit this line!
Main(require("fs").readFileSync("/dev/stdin", "utf8"));