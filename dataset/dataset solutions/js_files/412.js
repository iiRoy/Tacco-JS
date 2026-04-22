var all=[""];
for(var n=1;n<=10;n++){
   all[n]=[];
   var flag=[];
   for(var i=0;i<n;i++)flag[i]=true;
   var loop=function(str){
      if(str.length==n)all[n].push(str);
      else{
         for(var i=0;i<n;i++){
            if(flag[i]){
               flag[i]=false;
               loop(str+i);
               flag[i]=true;
            }
         }
      }
   };
   loop("");
}   
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
while(true){
   var n=arr.shift()-0;
   if(n==0)break;
   var food=[];
   for(var i=0;i<n;i++)food[i]=arr.shift().split(" ");
   var G=Infinity;
   var min;
   all[n].forEach(function(v,allIndex){
      var sum=0;
      var g=0;
      var flag=true;
      for(var i=0;i<n;i++){
         var value=v[i]-0;
         var w=food[value][1]-0;
         var s=food[value][2]-0;
         if(sum>s){flag=false;break;}
         sum+=w;
         g+=w*(n-i);
      }
      if(flag==false){
         g=g/sum;
         if(G>g){
            min=allIndex;
            G=g;
         }
      }
   });
   all[n][min].split("").map(Number).reverse().forEach(function(v){
      console.log(food[v][0]);
   });
}