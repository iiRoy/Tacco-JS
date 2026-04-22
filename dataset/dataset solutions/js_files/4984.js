function main(input) {
  var total = parseInt(input);
  for(var i = 0; i < input.length; i++) {
    var defa = 0;
    for(var j = 0; j < i; j++) {
      defa += parseInt(input.substr(j,1));
    }
    total += calc(input, i, defa);
  }
  console.log(total);
}

function calc(input, length, defa) {
  var total = 0;
  for (var i = 1; i < input.length - length; i++) {
    total += defa;
    total += parseInt(input.substr(length, i));
    total += parseInt(input.substr(i+length));
  }
  return total;
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));