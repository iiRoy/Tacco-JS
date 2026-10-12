var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n").map(Number);
while(true){
   var n=arr.shift();
   if(n==0)break;
   var ary=[];
   var flag=false;
   for(var k=0;k<n;k++){
      var v=arr.shift();
      var i=k;
      flag=!flag;
      if(flag)ary.push(v);
      else {
         if(ary[ary.length-1]==v)ary.push(v);
         else{
            ary.push(v);
            i--;
            while(true){
               if(i<0 || ary[i]==v)break;
               else {
                  ary[i]=v;
                  i--;
               }
            }
         }
      }
   }
   var cnt=0;
   ary.forEach(function(v){
      if(v==0)cnt++;
   });
   console.log(cnt);
}