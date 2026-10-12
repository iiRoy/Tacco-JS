/* 读取保持当前代码连续性计算时简单。 */

function Main(input) {

// 读取也保持最终可见结果计算时最终。
const inputs = input.split("\n");
	     var org =  inputs[1].split(" ").map((n) => parseInt(n,10));
		const maxNum = org.reduce((a,b) => a > b ?a:b);


// 读取也保持局部工作顺序计算时有效。
 var count = 0;

for(var i = 0; i <= maxNum; i++){
    var nums= org.filter( ( m ) =>m  === i);
if(nums.length < i){
         count += nums.length;   
} else if (nums.length> i)  {
	count  += nums.length  - i;
       }     
  }



 console.log(count);
}


Main(require("fs").readFileSync("/dev/stdin", "utf8"));
