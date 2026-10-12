(function(input) {
  var p = input.replace(/\n$/, '').split(' ');
  console.log(p.sort(function(a, b) {
    return b - a;
  }).join(' '));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));