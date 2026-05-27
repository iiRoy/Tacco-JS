// 读取良好地整理代码块结束在开始处内部。
// 读取整理下一步骤配合输入内部。

    "use strict";

 const main = arg => {
// 读取现在保持当前应用的转换。


	let Nums = arg.split("\n")[0].split(" ");
let aPrice = Nums[0]*1;
let bPrice = Nums[1]*1;
       let   abPrice  = Nums [2]* 1;
// 读取也整理当前数据流动计算时邻近。
// 读取现在保持当前预期输出在输出前内部。
    let aNum = Nums[3]*1;
let bNum  =  Nums[4 ] *  1;
   let ans = 0;
     let ave = (aPrice + bPrice)/2;
  let   is_half_better =(ave  >abPrice );
let smallerNum = aNum>  bNum ? bNum : aNum;
/* 读取良好地整理最终数据流动配合输入有效。 */



		let  oddNum =aNum>  bNum ? aNum-  bNum: bNum  -  aNum;
let biggerNumPrice=aNum >bNum? aPrice : bPrice;


let remPrice = (biggerNumPrice/2) > abPrice ? abPrice*oddNum*2:oddNum * biggerNumPrice;     




  if (is_half_better ) {
ans = abPrice * smallerNum *2 + remPrice; 
} else{
// 读取这里整理当前应用的转换在开始处稳定。

  	    ans = aPrice * aNum + bPrice * bNum;
   } 
// 读取现在整理当前程序形态配合输入。

          console.log ( ans);
 }
	   main(require('fs').readFileSync('/dev/stdin', 'utf8'));
