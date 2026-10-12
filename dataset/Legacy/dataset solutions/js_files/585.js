function bomb(x){
   var L=0;
   while(L!=x.length){
      L=x.length;
      x=x.replace(/1{4,}|2{4,}|3{4,}/g,"");
   }
   min=Math.min(min,x.length);
}
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
while(true){
   var N=Arr.shift()-0;
   if(N==0)break;
   var arr=[];
   for(var i=0;i<N;i++){
      var v=Arr.shift()-0;
      arr.push(v);
   }
   var min=Infinity;
   var str=arr.join("");
   for(var i=0;i<N;i++){
      var A=arr.slice();
      var B=arr.slice();
      if(i<N-1)A[i]=A[i+1];
      if(i>0)B[i]=B[i-1];
      bomb(A.join(""));
      bomb(B.join(""));
   }
   console.log(min);
}