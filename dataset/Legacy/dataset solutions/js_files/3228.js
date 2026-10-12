var readline = require('readline');
var lines = [];

var rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout,
});

rl.on('line',function(x){
    lines.push(x);
});

rl.on('close',function(){
    var tmp = lines.shift();
    var n = Number(tmp.split(" ")[0]);
    var m = Number(tmp.split(" ")[1]);
    var result = 0;

    var x = Array(m);
    var w = Array(m);
    tmp = lines[0].split(" ");
    for(var i=0;i<m;i++){x[i]=Number(tmp[i]);}
    x.sort(function(a,b){return(a-b);});
    
    w[0]=0;
    for(var i=1;i<m;i++){w[i]=x[i]-x[i-1];}
    w.sort(function(a,b){return(a-b);});
        
    for(var i=0;i<w.length-(n-1);i++){
        result = result + w[i];
    }

    console.log(result);
});