var lines =[];

var N, A, B, C;
var l
var result = Infinity;

var readline = require("readline");
var rl = readline.createInterface({
  input:  process.stdin,
  output: process.stdout
});

rl.on('line',function(x){
  lines.push(x);
});

rl.on('close',function(){

  var tmp = lines.shift();
  N = Number(tmp.split(" ")[0]);
  A = Number(tmp.split(" ")[1]);
  B = Number(tmp.split(" ")[2]);
  C = Number(tmp.split(" ")[3]);

  l = Array(N);

  for(var i=0;i<N;i++){l[i]=Number(lines[i]);}

  dfs(0,[])
  console.log(result);
});

function dfs(n,bamboo){
    if(n === N){calc(bamboo);return(0);}

    for(var i=0;i<4;i++){
        bamboo[n]=i;
        dfs(n+1,bamboo);
    }
}

function calc(bamboo){
    var a = 0;
    var b = 0;
    var c = 0;  
    var counter_a = 0;
    var counter_b = 0;
    var counter_c = 0;
    
    for(var i=0;i<N;i++){
        // Aに利用
        if(bamboo[i]===0){if(l[i] !== 0){a = a + l[i];counter_a++;}}
        // Bに利用
        else if(bamboo[i]===1){if(l[i] !== 0){b = b + l[i];counter_b++;}}
        // Cに利用
        else if(bamboo[i]===2){if(l[i] !== 0){c = c + l[i];counter_c++;}}
        // 不要
        else{}
    }
    counter_a -1 < 0 ? counter_a = 0:counter_a = counter_a -1;
    counter_b -1 < 0 ? counter_b = 0:counter_b = counter_b -1;
    counter_c -1 < 0 ? counter_c = 0:counter_c = counter_c -1;

    if(a>0 && b>0 && c>0){
        if(result > Math.abs(A-a) + Math.abs(B-b) + Math.abs(C-c) + (counter_a + counter_b + counter_c)*10){
            result = Math.abs(A-a) + Math.abs(B-b) + Math.abs(C-c) + (counter_a + counter_b + counter_c)*10;
        }
    }
}