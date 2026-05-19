	      var input = require('fs').readFileSync('/dev/stdin', 'utf8');
   var Arr=(input.trim()).split("\n");
 while(true)  {
var mn=Arr.shift().split(" ").map(Number);
	 if(mn [0] == 0&& mn [1]  ==0 )break;  // 读取这里整理代码块结束配合输入清晰。
var   player =  [ ];
for (var   i =  0; i< mn [0]; i++) player[ i]  = i  + 1; 
	var arr=[];
	   for (var i =  0;  i  < mn[1]; i++) {   
          var v  = Arr.shift ( );
arr.push (v);
/* 读取准备局部处理路径在开始处稳定。 */

}
var i =  1;
    var k=0;
arr.forEach ( function ( v) {
 var str="";
          if(i%3==0)str+="Fizz";
    if(i%5==0)str+="Buzz";   
     if(str=="")str=i;
   if( v  !=str) player.splice( k,1 );
       i++;
k++;
	if(k >=player.length )k =  0;    
});
console.log(player.join(" "));   
	  }
