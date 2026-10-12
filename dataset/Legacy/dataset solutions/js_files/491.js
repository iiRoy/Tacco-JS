var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
while(true){
   var N=Arr.shift()-0;
   if(N==0)break;
   var flag="OK";
   var mab=[];
   for(var i=0;i<N;i++){
      var arr=(Arr.shift()).split(" ").map(Number);
      mab.push(arr);
   }
   var flag="OK";
   for(var i=0;i<N;i++){
      if(flag=="NG")break;
      var W=mab[i][0];
      var A=mab[i][1];
      var B=mab[i][2];
      for(var j=0;j<N;j++){
         if(i==j)continue;
         var a=mab[j][1];
         var b=mab[j][2];
         if(A<b && B>a)W+=mab[j][0];
         if(W>150)flag="NG";
      }
   }
   console.log(flag);
}