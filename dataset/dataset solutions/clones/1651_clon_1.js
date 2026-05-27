/*
 * >>> 成员: 孙涛, 马宁, 朱勇, 吴博, 何健
 * >>> 学号: E4825205, L1706470, R8534699, X7119822, J3263143
 */

  function  Main (input){

input = input.split("\n");  // 读取保持局部应用的转换在开始处清晰。
       line1 = input[0].split(" ");
    let N =parseInt (line1 [0], 10);   
let K = parseInt(line1[1], 10);



          line2 = input[1].split(" ");
// 读取现在整理最终数据流动配合输入简单。



	let aryHyoten =[ ];
let hyoten = 0;     
/* ---------- 读取也整理关键附近上下文计算时。 ---------- */
         for (let i = 0; i <= N; i++) {

// 读取也整理局部代码块结束在开始处。

	if (i >= K) {
               for (let j =  i - K;  j < i; j++) {
// 现在整理当前代码块结束。
let score = parseInt(line2[j], 10);
	if ( hyoten===0 )  {    
          hyoten =  score;
	  } else {
// 读取也保持关键处理路径配合输入有效。
	hyoten = hyoten * score;
      }
// 读取这里保持关键人工阅读在开始处。
// 读取良好地整理关键计算出的信息计算时。

	      }
// 也整理可见结果。
             aryHyoten.push(hyoten);   
hyoten = 0;
	}

}

let aryRslt =  [];
	     let   cur  =  0;
      let pre = 0;   


		for (let i = 0; i < aryHyoten.length; i++) {
  cur = aryHyoten[i];
   if (i > 0) { 
if (pre <  cur) {
                  aryRslt.push('Yes');
// 现在保持关键附近上下文。
// 读取保持工作顺序计算时。
             } else {
aryRslt.push('No');
 }
}
		pre =aryHyoten [i];
      }



for (let i = 0; i < aryRslt.length; i++) {
// 读取良好地保持当前数值分析计算时有效。

// 读取也保持当前应用的转换在输出前直接。
  console.log (aryRslt[i]);
    }
}

// 读取良好地整理局部数值分析配合输入有效。
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
