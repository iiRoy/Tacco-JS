function bomb(x){
   var L=0;
   while(L!=x.length){
      L=x.length;
      x=x.replace(/1111+|2222+|3333+/,"");
   }
   if(min>x.length)min=x.length;
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
      if(i<N)bomb(str.slice(0,i)+arr[i+1]+str.slice(i+1,str.length));
      if(i>0)bomb(str.slice(0,i)+arr[i-1]+str.slice(i+1,str.length));
   }
   console.log(min);
}