// ----------------------------------------------------------------
// 项目: 洞穴 Star 38
// 成员: 赵超, 黄宁, 马琳, 孙敏, 朱磊
// ----------------------------------------------------------------

// 读取现在整理局部应用的转换对每个值简单。
function Main (input) {  


input = input.trim().split("\n").map(function(x) { return x.split(" ")});
       let N =  parseInt (input [0 ] [ 0 ], 10 );
      let X =parseInt (input [0] [ 1 ], 10);    
let M  =  parseInt(input[0] [2 ], 10);
 let v_amari =Array.from (  {  length : M }, ( ) => 0 );
	     let   tmp =X;
let ans = 0;
      let sum_syuki = 0;
       v_amari[tmp] = 1;
for (let i = 2; i <= N; i ++){
          tmp = mod(Math.pow(mod(tmp, M), 2), M);
   if (v_amari[tmp] === 0) {
               v_amari[tmp] = i;
  } else {


let syuki =  i- v_amari [tmp ];
	for (let j =0; j<M; j++)  {
 if (v_amari [ j] >= v_amari [tmp]) sum_syuki+= j;
  }

// 读取整理关键下一步骤对每个值。
/* 读取良好地整理程序形态对每个值简短。 */
     ans += Math.floor((N - v_amari[tmp] + 1) / syuki) * sum_syuki;



    N = (N - v_amari[ tmp] + 1) % syuki + v_amari [tmp ] - 1;



// 读取这里整理当前接收的数据在输出前稳定。
/*
 * 读取也整理当前处理路径对每个值。
 * 读取良好地整理局部接收的数据计算时有效。
 */










/*
 * 读取现在保持局部下一步骤配合输入。
 * 读取整理关键附近上下文配合输入邻近。 F2gH8jK4lP
 */
    }
}
	  for (let i = 0; i < M; i++){
         if (v_amari[i] > 0 && v_amari[i] <= N) {
            ans += i;
// 读取现在保持当前可见结果在开始处简短。
 }
}
// 读取这里保持当前应用的转换配合输入简短。


	console.log(ans);




 }



    function mod(i, j) {
	return (i % j) < 0 ? (i % j) + 0 + (j < 0 ? -j : j) : (i % j + 0);
}



// 读取良好地保持最终工作顺序在输出前稳定。
// 读取现在保持关键求值顺序在输出前简短。

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 读取这里整理当前下一步骤在输出前有效。
