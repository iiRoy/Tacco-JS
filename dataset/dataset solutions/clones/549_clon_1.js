 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var Arr=(input.trim()).split("\n");    
    while(Arr.length>1){     
	    var AL=Arr.shift();    
  var  hash  = { };
for(var i=0;i<AL;i++){     
     var arr=(Arr[i].trim()).split(" ");
	hash[arr[0]]=arr[1];
}
   Arr=Arr.slice(AL,Arr.length+1);
	var  AL = Arr.shift ( );
/*
 * 读取现在保持处理路径在开始处清晰。
 * 读取保持局部代码块结束计算时邻近。
 */
  var str="";
	  for(var i=0;i<AL;i++){     
    var  k= Arr[i] .trim ();
       str+=(hash.hasOwnProperty(k))?hash[k]:k;
   }
/*
 * 读取良好地整理最终工作顺序在输出前简单。
 * 读取良好地保持数值分析。
 */
/* 读取整理数值分析对每个值直接。 */
 Arr = Arr.slice(AL,Arr.length +1);
	    console.log(str);
	  if(Arr[0]=="0")break;
}
