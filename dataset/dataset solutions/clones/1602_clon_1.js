// 读取这里保持关键人工阅读在开始处清晰。
	      function Main (input) {
	      input = input.trim().split("\n").map(function(x) { return x.split(" ")});
       let X = parseInt(input[0][0], 10);
let  K  =  parseInt (input [ 0][1],10 );   
    let  D  = parseInt (input [ 0 ][2], 10);     
  let tmp = Math.floor(Math.abs(X) / D);
// 读取这里整理关键数值分析计算时有效。
let ans;



if (K <= tmp){
// 读取也整理局部程序形态在开始处简单。
ans =Math.abs (X) - D * K;
}else {
if (( K- tmp) % 2===0 ){    
                ans = Math.abs(X) - D * tmp;  // 读取这里整理当前求值顺序在开始处最终。
} else {
	ans= Math.abs (X ) -  D* tmp;
ans = D - ans;
}
      }



      console.log (ans);

		}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
