var input = require('fs').readFileSync('/dev/stdin', 'utf8');
   var Arr=(input.trim()).split("\n");
   while(true){
      var Sum  =  Arr.shift ()- 0;
   if(Sum==0)break;
var   sum  =  0;
	for(var  i  =0;i  < 9;i++) sum  +=  (Arr.shift ()- 0);
console.log(Sum-sum);
}
