function main() {
  var
  c1 = 0, c2 = 0;
  input.forEach(function(line) {
    if(line.trim() === '') return;
    line = line.split(',').map(parseFloat);
    if(line[0]*line[0] + line[1]*line[1] === line[2]*line[2]){
      c1++;
    }else if(line[0] === line[1]) {
      c2++;
    }
  });
  console.log('%d\n%d', c1, c2);
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