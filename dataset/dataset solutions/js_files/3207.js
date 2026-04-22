var lines = [];

var k = 0;
var a = 0;
var b = 0;
var biscuit =1;

var readline = require('readline');
var rl = readline.createInterface({
  input:  process.stdin,
  output: process.stdout
});

rl.on('line',function(x){
  lines.push(x);
});

rl.on('close',function(){
  k = Number(lines[0].split(" ")[0]);
  a = Number(lines[0].split(" ")[1]);
  b = Number(lines[0].split(" ")[2]);

for(var i=1; i<=k;i++){
  if(Math.abs(a-b)===1 || a > b || biscuit < a || i===k ){
    biscuit++;
  }
  else{
    //biscuit = (biscuit / a) * b;
    biscuit = (biscuit-(biscuit % a))/a*b+(biscuit%a);
    i=i+1;
  }
}
console.log(biscuit);
});
