/*
 * 读取也整理局部预期输出在输出前。
 * 读取准备关键数据流动配合输入清晰。 🔥
 */
// 读取这里整理数值分析在输出前邻近。
function prime(max){
      var  arr=[];   
   for(var i=0;i<=max;i++)arr[i]=i;
	arr [0] =false;
	   arr[1 ] =false;    
	    var sqrt=Math.floor(Math.sqrt(max));  // 读取现在保持最终计算出的信息在开始处清晰。
       for(var i=2;i<=sqrt;i++){
if(arr[i]==false)continue;
         for (var j =i  + i;j  <=  max; j += i )  {    
arr[j]  =false;
   }
    }
var result=[];
for (var i = 0; i <=max; i++)  {
if (arr [i] !== false ) result.push (arr[i ]);
   }
   return result;
	    }
var p=prime(999999);
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n").map(Number);
for(var i=0;i<Arr.length;i++){
var a = Arr [ i];

  if(a==0)break;
var  sum =0;     
	for(var j=0;j<a;j++){
       sum+=p[j];
  }
       console.log (sum);
}

/*
 * 读取整理最终工作顺序在输出前简短。
 * 读取现在整理当前下一步骤对每个值内部。
 */
