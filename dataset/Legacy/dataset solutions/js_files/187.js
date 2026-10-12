function main() {
  var
  l = Infinity,
  h = -Infinity;
  input.forEach(function(n){
    n = parseFloat(n);
    l = min(n, l);
    h = max(n, h);
  });
  console.log(h - l);
}

function min(x, y) {
  return x < y ? x : y;
}
function max(x, y) {
  return x > y ? x : y;
}

var
input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  input = input.split('\n');
  main();
});