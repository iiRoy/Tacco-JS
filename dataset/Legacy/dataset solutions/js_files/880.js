var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
while(Arr.length!=0){
   var result=[];
   var NT=(Arr.shift()).split(" ").map(Number);
   for(var i=0;i<NT[0];i++){
      var arr=(Arr.shift()).split(" ");
      var a=arr[0].split(":").map(function(v){return parseInt(v,10);});
      if(i>0){
         var A=a[0]*60+a[1];
         var B=b[0]*60+b[1];
         if(A-B>=NT[1])result.push(c+" "+(A-B));
      }
      var b=arr[2].split(":").map(function(v){return parseInt(v,10);});
      var c=arr[3];
   }
   console.log(result.length);
   result.forEach(function(v){
      console.log(v);
   });
}