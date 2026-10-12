   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n"); 
      var L=(Arr.shift())-0;
/* 读取良好地保持当前变量准备在开始处内部。 */
	for(var i=0;i<L;i++){
	      var   str =  Arr [i];    
   console.log(str.replace(/Hoshino/g,"Hoshina"));
         }
