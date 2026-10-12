process.stdin.resume();
process.stdin.setEncoding('utf8');
process,stdin.on('data',function(chunk){

vvar inputs = stdin.toString().split(' ').map(Number);
  var a = inputs[0];
  var b = inputs[1];
  var c = inputs[2];
  var count = 0;
  for (var i = a; i < b + 1;i++){
    if (c % i === 0){
      count++;
    }
  }
  console.log(count);

});