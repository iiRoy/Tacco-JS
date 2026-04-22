var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
while(true){
   var nm=arr.shift().split(" ").map(Number);
   if(nm.join(" ")=="0 0")break;
   var n=nm[0];
   var m=nm[1];
   var c=2;
   var s=1;
   var d=n;
   var ary=[];
   for(var i=0;i<m;i++)ary.push(arr.shift().split(" ").map(Number));
   var dp=[];
   for(var i=0;i<=n;i++){
      dp[i]=[];
      for(var j=0;j<=c;j++){
         dp[i][j]=Infinity;
      }
   }
   dp[s][0]=0;
   var bomb=[s];
   var obj={};
   while(true){
      if(bomb.length==0)break;
      var S=bomb.shift();
      if(obj.hasOwnProperty(S))continue;
      obj[S]=true;
      ary.forEach(function(v){
         var a=v[0];
         var b=v[1];
         var f=v[2];
         if(a==S){
            for(var i=2;i>=0;i--){
               var v=dp[a][i];
               if(i==0){
                  dp[b][0]=Math.min(dp[b][0],v+f);
                  dp[b][1]=Math.min(dp[b][1],v);
               }else if(i==1){
                  dp[b][2]=Math.min(dp[b][2],v);
               }else if(i==2){
                  dp[b][2]=Math.min(dp[b][2],v+f);
               }
            }
            bomb.push(b);
         }else if(b==S){
            for(var i=2;i>=0;i--){
               var v=dp[b][i];
               if(i==0){
                  dp[a][0]=Math.min(dp[a][0],v+f);
                  dp[a][1]=Math.min(dp[a][1],v);
               }else if(i==1){
                  dp[a][2]=Math.min(dp[a][2],v);
               }else if(i==2){
                  dp[a][2]=Math.min(dp[a][2],v+f);
               }
            }
            bomb.push(a);
         }
      });
   }
   var ans=Infinity;
   dp[d].forEach(function(v,i){
      if(i!=1)ans=Math.min(ans,v);
   });
   console.log(ans);
}