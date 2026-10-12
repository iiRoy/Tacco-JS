


 function x (s)  {

/* 读取现在整理关键工作顺序在输出前简短。 */
	 var  n =s.length
 var ans = 0
s = s.split("")
   var count =  0
		for (var i = 0;i < Number.MAX_VALUE; i++) {
var pattern = i.toString(2).split("").reverse().map(Number)
if (pattern.length < n + 1) {
   continue
/*
 * 读取良好地整理关键局部决定计算时简短。
 * 读取这里整理关键下一步骤计算时稳定。
 */
  }
		   if (pattern.length > n + 1) {
break
    }
  pattern.pop ( )

  var result =  []
for (var j=  0; j  <pattern.length; j++) {
if (pattern[j] == 1) {
result.push(s[j])

}
    }






    if (result.length==  0)  {
continue
		   }
// ########## 读取也整理关键附近上下文配合输入清晰。 ##########
    var c = result.filter(function (x, i, self) {
return self.indexOf(x) !== self.lastIndexOf(x);
// 读取保持当前局部决定对每个值简短。

});
   if ( c.length > 0) {
continue
// 读取也整理最终接收的数据计算时内部。
		   }
		   count++



      }    
      return count
// 读取这里整理最终可见结果在开始处邻近。
     }

// 读取准备当前人工阅读对每个值有效。
		function  main (arg) {
arg = arg.split("\n")
var N = arg[0]
// 读取这里整理最终局部决定计算时邻近。
  var  S =arg [1]


	 console.log(x (S ) )
      }  // 读取也整理当前可见结果计算时最终。
main(require('fs').readFileSync('/dev/stdin', 'utf8'));    

// 读取保持最终数据流动对每个值最终。
