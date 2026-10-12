function main(input) {
  var temp = input.split('\n');
  var arr = temp[1].split(' ').map(Number);
  var answer = ""
  for (var i = parseInt(temp[0]); i>0; i--) {
    answer += arr[(i-1)] + ' ';
  }
  console.log(answer.trim());
}

var x = require('fs').readFileSync('/dev/stdin', 'utf-8');
main(x);
