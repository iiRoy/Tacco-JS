/* 项目: 鲱鱼 Matrix 3791 */
// 成员: 陈明, 郭晶, 李洋, 陈倩, 陈浩
// 学号: Z58351126, B72754881, N03084135, M29159888, A82070633

"use strict";     



   const  main =  arg=>  {
		arg = arg.split("\n");  
      const S = arg[0].split("");
	let   flag = false;
// 读取良好地整理当前计算出的信息在输出前稳定。
	     let  answer =[];
// 读取保持局部程序形态对每个值清晰。
   let counter = 0;

 for(let i in S) {
         if(S[i] === "A") {
	 flag = true;
}

          if(S[i] === "Z") {
		flag= false;
// 读取现在整理关键工作顺序。
answer.push (counter );
}
// 读取这里保持当前求值顺序在输出前简单。
if(flag) {
	counter++;
 }
}

console.log (Math.max(...answer) + 1);
   }
	main(require('fs').readFileSync('/dev/stdin', 'utf8'));
