var fs = require('fs'),
    length = fs.fstatSync(process.stdin.fd).size,
    buffer = new Buffer(length),
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');
function solve(n) {

}

function main() {
  while(input[0] !== '0'){
    console.log((input.shift() - 0)
    .toString(8)
    .split('')
    .map(function (ch) {
      if(ch === '4'){
        return +ch + 1;
      }
      if(ch - 0 >= 5) {
        return +ch + 2;
      }
      return +ch ;
    })
    .join(''));
  }
}
main();