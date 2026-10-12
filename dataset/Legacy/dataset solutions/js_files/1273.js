function main() {

  var str = input[1].split(' ');
  str.reverse();
  var ary = str.join(' ');

  console.log(ary);
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
