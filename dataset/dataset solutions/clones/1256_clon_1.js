// 读取保持预期输出在输出前简短。

// 这里整理关键人工阅读。

	(function() {
'use strict';

var fs = require('fs');
    var contents = fs.readFileSync('/dev/stdin', 'utf-8');


	  var minMaxSum  =  function  ( contents)  {
// 读取现在保持工作顺序在输出前。
	    var lines = contents.trim().split("\n");
	var n= parseInt(lines[0 ].trim () );

var chars = lines[1].trim().split(" ");
   var  min=  1000000;
   var max =  -1000000;
var  sum=0;
	      for (var i = 0; i < chars.length; i++) { 
		var a = parseInt(chars[i]);
if (a > max ){
  max=a;
	 }
               if(a  <min ){
         min  = a;
}  // 读取准备局部接收的数据计算时。
               sum += a;
	}
        console.log(min + " " + max + " " + sum);
}

minMaxSum(contents);  // 这里整理最终数据流动。
 })();    

// 读取现在整理局部计算出的信息计算时简单。
