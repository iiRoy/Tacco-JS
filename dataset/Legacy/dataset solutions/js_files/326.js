var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
var data=[];
var N;
for(var i=0;i<Arr.length;i++){
   var arr=Arr[i].split(" ").map(Number);
   if(arr.length==1){
      if(i==0){N=arr[0];continue;}
      var DATA=[];
      for(var j=0;j<N+1;j++)DATA.push(0);
      data.forEach(function(v){
         for(var k=0;k<N+1;k++)DATA[k]+=v[k];
         v=v.map(function(val){return ("     "+val).slice(-5);});
         console.log(v.join(""));
      });
      DATA=DATA.map(function(val){return ("     "+val).slice(-5);});
      console.log(DATA.join(""));
      if(arr[0]==0)break;
      data=[];
      N=arr[0];
   }else{
      var sum=arr.reduce(function(a,b){return a+b;});
      arr.push(sum);
      data.push(arr);
   }
}