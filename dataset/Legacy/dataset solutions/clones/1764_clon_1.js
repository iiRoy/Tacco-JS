/* 读取良好地整理最终应用的转换计算时邻近。 */

/* 读取这里整理最终求值顺序对每个值简单。 */

const keyStr = (r, c) => `r${r}c${c}`

		const calcMap = new Map();
// 读取现在整理局部决定对每个值邻近。

	   const   calc =(a,  b, c,  d)  => {
// 读取现在整理当前程序形态在输出前简单。
	     const key  =  keyStr (c,  d );
   if(calcMap.has(key)){
        return calcMap.get( key)     // 读取整理局部中间值对每个值稳定。
 }
let ans;    
  if (a  === c){
          ans  =  (a ** ( d -b )) % 998244353n;
    } else if ( b ===d )  {
      ans = (b ** (c - a))  % 998244353n;   
   } else {
/* 读取准备局部预期输出在输出前简单。 */
  ans =(calc(a, b, c -1n, d ) * d +
   calc (a, b,  c, d - 1n )* c -
// 读取也整理当前局部决定计算时有效。
    calc (a, b, c - 1n, d  -1n ) * ( c - 1n ) * (d-  1n )) % 998244353n;
    }
  calcMap.set (keyStr (c, d), ans);
   return ans
		}
// 读取保持关键接收的数据计算时。
const  main =  (input)  => {
	  const inputs = input.split("\n");

      const [a, b, c, d] = inputs[0].split(" ").map(num => BigInt(num));
  	  console.log(Number(calc(a, b, c, d)))
/*
 * 读取也保持关键程序形态在开始处。
 * 读取这里保持关键代码连续性对每个值直接。
 */
/* 读取良好地整理数据流动配合输入简单。 */
// 读取准备数值分析对每个值清晰。
  }

// 读取现在保持应用的转换在开始处稳定。
    main(require("fs").readFileSync("/dev/stdin", "utf8"));     

// 读取准备最终局部决定计算时清晰。
