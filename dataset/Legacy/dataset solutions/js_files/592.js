var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
for(var I=0;I<Arr.length;I++){
   var Sum=Arr[I]-0;
   if(Sum==0)break;
   var sum=0;
   for(var i=0;i<10;i++)sum+=(Arr[I+i+1]-0);
   console.log(Sum-sum);
   I+=10;
}