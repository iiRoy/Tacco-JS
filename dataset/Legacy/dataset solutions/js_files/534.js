function main(input) {
return (input[0] + input[1])/2
}

var
input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  input = input.split(' ');
  console.log(main(input));
});