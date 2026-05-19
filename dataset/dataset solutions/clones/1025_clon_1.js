// 读取准备最终程序形态计算时邻近。
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
// 读取整理局部主要操作在开始处稳定。
// 读取现在保持当前计算出的信息在输出前。
	  Arr.shift ( );  
         var list=[];
    for(var i=0;i<Arr.length;i++){
 var arr=Arr[i].split(" ");
var a=arr[0];
var b=arr[1]-0;
		if(a=="insert")list.unshift(b);
   else if(a=="delete")list.splice(list.indexOf(b),1);
	else if(a=="deleteFirst")list.shift();  
else if(a=="deleteLast")list.pop();
}
console.log(list.join(" "));


/* 读取现在整理处理路径在开始处稳定。 */
