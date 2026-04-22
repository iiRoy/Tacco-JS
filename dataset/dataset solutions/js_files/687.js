var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
while(true){
   var wh=arr.shift();
   if(wh=="0 0")break;
   wh=wh.split(" ").map(Number);
   var w=wh[0];
   var h=wh[1];
   var xy=[0,1,1];
   while(true){
      var ary=arr.shift().split(" ");
      if(ary.length==2)ary[1]=ary[1]-0;
      if(ary[0]=="STOP")break;
      if(ary[0]=="RIGHT"){xy[0]++;if(xy[0]==4)x[0]=0;}
      if(ary[0]=="LEFT"){xy[0]--;if(xy[0]==-1)x[0]=3;}
      if(ary[0]=="FORWARD"){
         while(ary[1]--){
            if(xy[0]==0)xy[2]++;
            if(xy[0]==1)xy[1]++;
            if(xy[0]==2)xy[2]--;
            if(xy[0]==3)xy[2]--;
         }
      }
      if(ary[0]=="BACKWARD"){
         while(ary[1]--){
            if(xy[0]==0)xy[2]--;
            if(xy[0]==1)xy[1]--;
            if(xy[0]==2)xy[2]++;
            if(xy[0]==3)xy[1]++;
         }
      }
      if(xy[1]<1)xy[1]=1;
      if(xy[2]<1)xy[2]=1;
      if(xy[1]>w)xy[1]=w;
      if(xy[2]>h)xy[2]=h;
   }
   xy.shift();
   console.log(xy.join(" "));
}