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
 var n = Number(lines[0]);
 var a = 0;
 var b = 0;
 var array = [];
 var p = lines[1].split(' ');
 p = p.map(function(str) { return Number(str)});
 var q = lines[2].split(' ');
 q = q.map(function(str) { return Number(str)});
 
 function junretsu(balls, nukitorisu){
  var arrs, i, j, zensu, results, parts;
  arrs = [];
  zensu = balls.length;
  if(zensu < nukitorisu){
    return;
  }else if(nukitorisu == 1){
    for(i = 0; i < zensu; i ++){
      arrs[i] = [balls[i]];
    }
  }else{
    for(i = 0; i < zensu; i ++){
      parts = balls.slice(0);
      parts.splice(i, 1)[0];
      results = junretsu(parts, nukitorisu - 1);
      for(j = 0; j < results.length; j ++){
        arrs.push([balls[i]].concat(results[j]));
      }
    }
  }
  return arrs;
}
for(i=1; i<=n; i++){
  array.push(i);
}
var arr = junretsu(array, n);
var i=0;
arr.forEach(item => {
  i++;
  if(JSON.stringify(item) == JSON.stringify(p)){
    a = i;
  }
  if(JSON.stringify(item) == JSON.stringify(q)){
    b = i;
  }
})
  
  console.log(Math.abs(a-b));
});