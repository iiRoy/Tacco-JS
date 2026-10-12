var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=input.split("\n");
Arr.shift();
var shcd="SHCD".split("");
var str="";
for(var i=0;i<4;i++){
    for(var j=1;j<=13;j++){
        var card=shcd[i]+" "+j;
        if(Arr.indexOf(card)===-1)str+=card+"\n";
    }
}
if(str!=="")console.log(str.trim());