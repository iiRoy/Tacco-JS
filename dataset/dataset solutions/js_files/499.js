function calc(x1, y1, z1, w1, x2, y2, z2, w2){ 
var arr=[0,0,0,0];
arr[0]+=(x1*x2);
arr[1]+=(x1*y2);
arr[2]+=(x1*z2);
arr[3]+=(x1*w2);

arr[1]+=(y1*x2);
arr[0]-=(y1*y2);
arr[3]+=(y1*z2);
arr[2]-=(y1*w2);

arr[2]+=(z1*x2);
arr[3]-=(z1*y2);
arr[0]-=(z1*z2);
arr[1]+=(z1*w2);

arr[3]+=(w1*x2);
arr[2]+=(w1*y2);
arr[1]-=(w1*z2);
arr[0]-=(w1*w2);
return arr;
}
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
var N=Arr.shift()-0;
for(var I=0;I<N;I++){
   if(Arr[I]==0)break;
   var A=Arr[I].split(" ").map(Number);
   var ans=calc.apply(null,A);
   console.log(ans.join(" "));
}