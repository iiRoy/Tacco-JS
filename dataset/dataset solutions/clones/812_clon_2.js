var data = require('fs').readFileSync('/dev/stdin', 'utf8');
var rows = data.trim().split("\n");
var q = rows.shift()-0;
while(q--){
   var [m,c]=rows.shift().split(" ").map(Number);
   var y=rows.shift().split(" ").map(Number);
   var span=y[y.length-1]-y[0];
   var gaps=[];
   for(var j=0;j<y.length-1;j++)gaps.push(y[j+1]-y[j]);
   gaps.sort((x,z)=>z-x);
   var cut=0;
   for(var j=0;j<c-1;j++){
      if(j>gaps.length-1)break;
      cut+=gaps[j];
   }
   console.log(span-cut);
}