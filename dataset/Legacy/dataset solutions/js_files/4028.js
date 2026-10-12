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
 var a = lines[1].split(' ');
 a = a.map(function(str) { return Number(str)});
 a.sort(koujun);
 var max = 0;
 var alice = 0;
 var bob = 0;

 // while(true){
 //   max = Math.max(...a);
 //   alice += max;
 //   var index = a.indexOf(max);
 //   a.splice(index,1);
 //   n--;
 //   if(n == 0){
 //     break;
 //   }
 // 
 //   max = Math.max(...a);
 //   bob += max;
 //   var index = a.indexOf(max);
 //   a.splice(index,1);
 //   n--;
 //   if(n == 0){
 //     break;
 //   }
 // 
 // }
 // 
 for(i=0; i<n; i++){
   if(i % 2 == 1){
     alice += a[i];
   }else{
     bob += a[i];
   }
 }

 console.log(alice - bob);
});