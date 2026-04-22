rocess.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data',function(chunk){


var line = chunk.split(' ');
var a = Number(line[0]);
var b = Number(line[1]);
var c = Number(line[2]);
var count = 0;

for(var i = a; i < b ; i++){

if(c % i ==0){
    count++;
  }
 }
console.log(count);
});