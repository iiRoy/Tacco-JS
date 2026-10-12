process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
  var input = chunk.split(" ");
  var x = new Array();
  for(var i=0;i<3;i++){
    x[i] = parseInt(input[i],10);
  }
  x.sort();
  console.log(x[0] + " " + x[1] + " " + x[2]);
});