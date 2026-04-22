var fs = require('fs'),
length = fs.fstatSync(process.stdin.fd).size,
buffer = new Buffer(length),
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
input = buffer.toString('utf8', 0, bytesRead).split('\n');
main();

function main(){
  var w = parseInt(input[0], 10);
  var n = parseInt(input[1], 10);

  var goto = new Int8Array(w);
  for(var i = 0, len = goto.length; i < len; i++){
    goto[i] = i;
  }

  for(var i = 2; i < n + 2; i++){
    var c = input[i].split(",");
    var from = parseInt(c[0], 10) - 1;
    var to = parseInt(c[1], 10) - 1;

    goto[from] ^= goto[to];
    goto[to] ^= goto[from];
    goto[from] ^= goto[to];
  }

  for(var i = 0; i < len; i++){
    console.log(goto[i] + 1);
  }
}