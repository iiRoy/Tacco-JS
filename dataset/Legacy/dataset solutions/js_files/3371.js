function main(input){
  var line1 = input[0].split(' ');
  var n = line1[0];
  var h = parseInt(line1[1]);
  var w = parseInt(line1[2]);
 
  var ans = 0;
  for (var i=1; i<input.length; i++){
    var line = input[i].split(' ');
    var a = parseInt(line[0]);
    var b = parseInt(line[1]);
    
    if (a>=h && b>=w) 
      ans ++;
  }

  console.log(ans);
}


function parse(line){
  var ret = [];
  var arr = line.split(' ');
  for (var i = 0; i < arr.length; i++) {
    ret.push(parseInt(arr[i]));
  }
  return ret;
}

var input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  input = input.split('\n');
  main(input);
});
