function knapsack(){
   var C=[];
   for(var i=0;i<=N;i++)C[i]=[];
   for(var i=0;i<=W;i++)C[0][i]=0;
   for(var i=0;i<=N;i++)C[i][0]=0;
   for(var i=1;i<=N;i++){
      for(var j=1;j<=W;j++){
         if(items[i].w<=W){
            if(items[i].v+C[i-1][j-items[i].w]>C[i-1][j]){
               C[i][j]=items[i].v+C[i-1][j-items[i].w];
            }else{
               C[i][j]=C[i-1][j];
            }
         }else{
            C[i][j]=C[i-1][j];
         }  
      }
   }
   return C[N][W];
}    

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
var NW=(Arr.shift()).split(" ").map(Number);
var n=NW[0];
var W=NW[1];
var obj={};
for(var i=1;i<=n;i++){
   var arr=(Arr.shift()).split(" ").map(Number);
   var k=1;
   while(arr[1]*k<=W){
      if(arr[1]*k in obj){
         if(obj[arr[1]*k]>arr[0]*k){k++;continue;}
      }
      obj[arr[1]*k]=arr[0]*k;
      k++;
   }
}
var items=[null];
for(var p in obj){
   items.push({v:obj[p],w:p});
}
var N=items.length-1;
var max=knapsack();
console.log(max);