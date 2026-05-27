var dataLines = require('fs').readFileSync('/dev/stdin', 'utf8').split("\n");

dataLines = dataLines[1].split(" ");

var greatestValue = 0;

for (var counter = 1; ; counter++) {
  var accumulator = 0;

  dataLines.forEach((element) => {
    accumulator += counter % Number(element);
  });

  if (accumulator === 0) {
    break;
  }

  if (greatestValue < accumulator) {
    greatestValue = accumulator;
  }
}

console.log(greatestValue);
