var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var input_array =input.trim().split("\n");
var numbers = input_array[1].split(' ').map((n) => Number(n));

var exchange_count = 0;



for (var i = 0; i < numbers.length; i++) {
  var min_index = i;
  for (var j = i; j < numbers.length; j++) {
    min_index = numbers[j] < numbers[min_index] ? j : min_index; 
  }
  if (min_index !== i) {
    var tmp = numbers[min_index];
    numbers[min_index] = numbers[i];
    numbers[i] = tmp;
    exchange_count++;
  }
}

console.log(numbers.join(' '));
console.log(exchange_count);
