var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n").map(Number);
while(true){
   var n=arr.shift();
   if(n==0)break;
   var stone=[];
   while(n--)stone.push(arr.shift());
   var ary=[];
   stone.forEach(function(v,i){
      if((i+1)%2==1)ary.push(v);
      else {
         if(ary[ary.length-1]==v)ary.push(v);
         else{
            ary.push(v);
            while(true){
               i--;
               if(i>0 && ary[i]!=v)continue;
               else {
                  if(i<0)i=0;
                  while(i!=ary.length-1){
                      ary[i]=v;
                      i++;
                   }
                   break;
               }
            }
         }
      }
   });
   var cnt=0;
   ary.forEach(function(v){
      if(v==0)cnt++;
   });
   console.log(cnt);
}