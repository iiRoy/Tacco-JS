function main(input){
  var ans = 0;
  for (var i=0; i<input[0].length; i++){
    if (input[0][i] === '2') 
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
