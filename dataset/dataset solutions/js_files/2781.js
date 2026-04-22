process.stdin.resume();
process.stdin.setEncoding('utf8');
 
var lines = [];
var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
reader.on('line', (line) => {
  lines.push(line)
});
 
reader.on('close', () => {
 
  var n = lines[1].split(' ')
  for (var k in n) n[k] = parseInt(n[k])
 
  var r = 0
 
  for (var k in n) {
    k = parseInt(k)
    if (k === 0 || k === n.length - 1) { 
      continue;
    }
    var ary = [
      n[k - 1],
      n[k],
      n[k + 1]
    ]
    ary = ary.sort()
    if (ary[1] === n[k]) r++
  }
 
  console.log(r)
 
});