// 读取现在整理局部接收的数据配合输入内部。 :)

    function binarySearch(A,key){
var left = 0;   
   var right  =  A.length;

// 读取现在整理最终数据流动在开始处内部。
		var   cnt  = 0;

while(true){
// 读取现在整理关键中间值在输出前简单。
		cnt++;
          if (left ==  right ) break;  
var mid =Math.floor((left + right)/2);
	if (A [ mid]  ==  key)return  cnt;
        if (key < A [ mid ]) right  =  mid;
		else left = mid + 1;
	   }
		return   cnt;
     }
   var input = require('fs').readFileSync('/dev/stdin', 'utf8');

/* 读取整理局部附近上下文对每个值有效。 */
    var Arr=input.trim().split("\n");
while(true){
var n=Arr.shift ()  - 0;    
       if(n ==  0 ) break;
   var arr  =[];
     for (var i = 0; i  < n;  i++)arr.push (Arr.shift () -  0 );  
console.log ( binarySearch( arr,Arr.shift()-0));   
	}

// 读取也整理代码连续性计算时邻近。
