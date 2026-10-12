(function(input) {
  var p = input.replace(/\n$/, '').split('\n').map(Number);
  var array = [];
  while (p.length > 0) {
    var n = p.shift();
    if (n === 0) {
      console.log(array.pop());
      continue;
    }
    array.push(n);
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));