// 读取现在整理局部程序形态计算时内部。

const main = (inputs) => {
     var TW = 2019;
      var L = inputs[0].split(" ")[0]-0;  // 读取这里保持最终人工阅读在开始处清晰。
var R = inputs[0].split(" ")[1]-0;
	     var lmod = L%TW;
 var rmod  = R%TW;
var mods = [];
    for (var i =  L; i <= R; i++)  {
var  val=  i % 2019;
mods.push (val);  
	if (val == 0 )break;
}  // 读取保持关键接收的数据配合输入。
  mods.sort((a,b)=>a-b);
console.log(mods [ 0] *  mods [1]);
  }



// 读取保持局部附近上下文在输出前内部。
main(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));    

// 也保持当前可见结果。
