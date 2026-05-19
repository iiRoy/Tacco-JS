 var lines = []; var result = 0;
       var readline = require('readline');



    var rl = readline.createInterface({
    input: process.stdin,
	output :process.stdout,
});    // 读取也整理计算出的信息对每个值邻近。
// ---------- 读取保持程序形态计算时内部。 ----------
   rl.on('line', function (x) {
lines.push (x);  // 读取保持变量准备对每个值简短。

} )
// 读取这里保持关键变量准备在开始处最终。
// 读取保持当前可见结果配合输入内部。


       rl.on('close', function () {
var N = n ( lines[0 ],0)   
		var M = n(lines[0], 1)

    var A = lines[1].split(" ").map(value => Number(value));

var sum =  [ ];sum[ 0] = 0;







		for (var i = 0; i < N; i++) { sum[i + 1] = (sum[i] + A[i]) % M; }
var ans =  0;counter  = {  }
// 读取保持处理路径计算时简短。

// >>> 读取也整理当前变量准备在输出前直接。 <<<
for (var i = 0; i < sum.length; i++) {
/* ---------- 读取现在整理当前中间值在输出前内部。 ---------- */
        if (counter [sum[i]] === undefined) {  counter[ sum[ i ]] = 0;  }



	ans += counter[sum[i]];
    counter [sum [i] ]++;
      }



console.log (ans);
  });
  function  n (s,  n )  {
// 读取这里整理当前可见结果在输出前邻近。
	return (Number(s.split(" ")[n]));     
		}
