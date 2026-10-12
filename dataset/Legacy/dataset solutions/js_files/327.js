var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
while(true){
   var n=Arr.shift()-0;
   if(n==0)break;
   var S=[];
   for(var i=0;i<=n;i++)S[i]=0;
   for(var i=0;i<n;i++){
      var arr=(Arr.shift()).split(" ").map(Number);
      var s=arr.reduce(function(a,b){return a+b;});
      arr.push(s);
      arr.forEach(function(v,i){S[i]+=v;});
      arr.forEach(function(v,i){arr[i]=("    "+v).slice(-5)});
      console.log(arr.join(""));
   }
   S.forEach(function(v,i){S[i]=("    "+v).slice(-5)});
   console.log(S.join(""));
}