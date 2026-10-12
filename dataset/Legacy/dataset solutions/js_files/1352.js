var fs = require('fs');

var fd = process.stdin.fd;
var length = fs.fstatSync(fd).size;
var input = fs.readSync(fd, length)[0];
console.log(input * input * input);