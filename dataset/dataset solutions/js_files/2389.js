process.stdin.resume();
process.stdin.setEncoding('utf8');

var lines = []
var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

reader.on('line', (line) => {
  lines.push(line);
});

reader.on('close', () => {
  var num = parseInt(lines[0]);
  var list = lines[1];
  list = list.split('');
  var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  var result = '';
  for(var i=0; i<list.length; i++){
    var idx = alphabet.indexOf(list[i]);
    var new_idx = 0;
    if(idx + num > 25){
      new_idx = idx + num - 26;
    }else{
      new_idx = idx + num;
    }
    result += alphabet[new_idx];
  }
  console.log(result);
});
