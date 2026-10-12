var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
while(true){
   var hw=arr.shift().split(" ").map(Number);
   if(hw.join(" ")=="0 0")break;
   var h=hw[0];
   var w=hw[1];
   var yx=[];
   for(var y=0;y<h;y++){
      var ary=arr.shift().split("");
      yx[y]=[];
      ary.forEach(function(v,x){
         if(y==0 && v==".")yx[y][x]=1;
         else if(y==0 && v!=".")yx[y][x]=0;
         else if(y!=0 && v==".")yx[y][x]=yx[y-1][x]+1;
         else if(y!=0 && v!=".")yx[y][x]=0;
      });
   }
   var max=0;
   for(var k=0;k<h;k++){
      var s=[];
      yx[k][w]=0;
      for(var x=0;x<=w;x++){
         var v=yx[k][x];
         if(s.length==0){
            s.push([v,x+1]);
            continue;
         }
         if(s[s.length-1][0]<v)s.push([v,x]);
         else if(s[s.length-1][0]==v)continue;
         else if(s[s.length-1][0]>v){
            while(s.length!=0){
               var r=s.pop();
               if(v>r[0]){s.push(r);break;}
               else if(v==r[0])break;
               else if(v<r[0])max=Math.max(max,r[0]*((x+1)-r[1]));
            }
         }
      }
   }
   console.log(max);
}