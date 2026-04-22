function knapsack(){
   var C=[];
   for(var i=0;i<=N;i++)C[i]=[];
   for(var i=0;i<=W;i++)C[0][i]=0;
   for(var i=0;i<=N;i++)C[i][0]=0;
   for(var i=1;i<=N;i++){
      for(var j=1;j<=W;j++){
         var k=Math.floor(j/items[i].w);
         var ww=k*items[i].w;
         var vv=k*items[i].v;
         if(ww<=W){
            if(vv+C[i-1][j-ww]>C[i-1][j]){
               C[i][j]=vv+C[i-1][j-ww];
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
var N=NW[0];
var W=NW[1];
var items=[null];
for(var i=1;i<=N;i++){
   var arr=(Arr.shift()).split(" ").map(Number);
   items[i]={v:arr[0], w:arr[1]};
}
var max=knapsack();
console.log(max);