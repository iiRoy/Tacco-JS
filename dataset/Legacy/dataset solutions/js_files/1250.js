process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.('data',function(chunk){

for (var i = 0; i < line .length; i++) {
    if (line [i] === '0 ? 0') {
      break;
    }

var line = chunk.toString().map(Number);
a = Number(line[0]);
b = Number(line[1]);
op = line[2];

if ( op == +){
     console.log(a + b);
 } else if(op == -){
     console.log(a - b);
 }else if (op == /){
     console.log(Math.floor(a / b));
 }else if (op == *){
     console.log(a * b);
 }
});