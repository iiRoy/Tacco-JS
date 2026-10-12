function main(input){
  var line1 = parse(input[0]);
  var n = line1[0];
  var m = line1[1];
  var x = line1[2];
  var line2 = parse(input[1]);
  
  var costN = line2.filter((a) => a>x).length;
  console.log(Math.min(costN, m-costN));
}

function parse(line){
  var ret = [];
  var arr = line.split(' ');
  for (var i = 0; i < arr.length; i++) {
    ret.push(parseInt(arr[i]));
  }
  return ret;
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
  main(input);
});
