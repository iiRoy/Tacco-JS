var fs = require('fs'),
    length = fs.fstatSync(process.stdin.fd).size,
    buffer = new Buffer(length),
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');

!function (k) {
  input.forEach(function (l){
    return l - 0 && console.log(
      (l - 0)
      .toString(8)
      .split('')
      .map(function (ch) { return k[ch - 0]; })
      .join('')
    );
  });
}([0, 1, 2, 3, 5, 7, 8, 9]);