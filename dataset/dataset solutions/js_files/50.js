function heron(a,b,c){
   var s=(a+b+c)/2;
   var S=Math.sqrt(s*(s-a)*(s-b)*(s-c));
   return S;
}
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
for(var I=0;I<Arr.length;I++){
   var arr=Arr[I].split(" ").map(Number);
   var x1=arr[0];var y1=arr[1];
   var x2=arr[2];var y2=arr[3];
   var x3=arr[4];var y3=arr[5];
   var xp=arr[6];var yp=arr[7];
   var d12=Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));
   var d13=Math.sqrt(Math.pow(x1-x3,2)+Math.pow(y1-y3,2));
   var d23=Math.sqrt(Math.pow(x2-x3,2)+Math.pow(y2-y3,2));
   var dp1=Math.sqrt(Math.pow(xp-x1,2)+Math.pow(yp-y1,2));
   var dp2=Math.sqrt(Math.pow(xp-x2,2)+Math.pow(yp-y2,2));
   var dp3=Math.sqrt(Math.pow(xp-x3,2)+Math.pow(yp-y3,2));
   var S123=heron(d12,d13,d23);
   var s123=heron(d12,dp1,dp2)+heron(d13,dp1,dp3)+heron(d23,dp2,dp3);
   console.log((Math.abs(S123-s123)<0.0005)?"YES":"NO");
}