var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
while(true){
   var nm=Arr.shift().split(" ").map(Number);
   var n=nm[0];
   var m=nm[1];
   if(n==0 && m==0)break;
   var arr=[];
   for(var i=0;i<n;i++)arr.push(Arr.shift()-0);
   arr.push(0);
   var Q=[];
   for(var i=0;i<arr.length;i++){
     for(var j=i;j<arr.length;j++){
        Q.push(arr[i]+arr[j]);
     }
   }
   Q.sort(function(a,b){return a-b;});
   var memo=-1;
   Q=Q.filter(function(v){
     if(memo!=v){
        memo=v;
        return v;
     }
   });
   var max=0;
   for(var i=0;i<Q.length;i++){
     for(var j=i;j<Q.length;j++){ 
        var sum=Q[i]+Q[j];
        if(sum>m)break;
        if(max<sum)max=sum;
     }
  }
  console.log(max);
}