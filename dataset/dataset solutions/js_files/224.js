function main() {
  input.forEach(function(n) {
    if(n.trim() === '') return;
    n = parseFloat(n);
    console.log(s(n));
  });
}

function s(n) {
  var
  i, x = 10,
  a = [n];
  for(i = 2; i <= 10; i++) {
    if(i % 2 === 0) {
      a[a.length] = a[a.length - 1] * 2;
    }else{
      a[a.length] = a[a.length - 1] / 3;
    }
  }
  return a.reduce(function(a, b){
    return a + b;
  });
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