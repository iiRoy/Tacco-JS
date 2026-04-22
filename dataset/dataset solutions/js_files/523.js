var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
var nrl=arr.shift().split(" ").map(Number);
var n=nrl[0];
var L=nrl[2];
var t=[];
var max=[0,0];
var time=0;
for(var i=0;i<n;i++)t[i]=[0,0,i];
arr.push([1,L,0].join(" "));
for(var i=0;i<arr.length;i++){
   var v=arr[i].split(" ").map(Number);
   var d=v[0]-1;
   var T=v[1];
   var x=v[2];
   t[max[0]][1]+=T-time;
   time=T;
   t[d][0]+=x;
   if(x>0){
      if(t[d][0]>max[1])max=[d,t[d][0]];
      else if(t[d][0]==max[1] && d<=max[0])max=[d,t[d][0]];
   }
   else if(x<0 && max[0]==d){
      var MAX=0;
      var m=0;
      for(var j=0;j<t.length;j++){
         if(MAX<t[j][0]){m=j;MAX=t[j][0];}
      }
      max=[m,t[m][0]];
   }
}
t.sort(function(a,b){
   if(a[1]==b[1])return a[2]-b[2];
   else return b[1]-a[1];
});
console.log(t[0][2]+1);