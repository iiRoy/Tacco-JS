// parameter "input" gets all data
function Main(input) {
  var array = input.split('');
  var result = 'AC';

  if (array[0] != 'A') {
    result = 'WA';
  }

  var cFound = false;
  for (var i = 1; i < input.length; i++) {
    if (array[i] === 'C') {
      if (i === 1 || i === input.length - 1 || cFound) {
        result = 'WA';
      } else {
        cFound = true;
      }
    } else if (array[i].match(/[A-Z]/)) {
        result = 'WA';
    }
  }

  if (cFound === false) {
    result = 'WA';
  }

  console.log(result);
}
// Don't edit this line!
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
