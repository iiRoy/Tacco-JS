    const keyStr = (r, c) => `r${r}c${c}`  
    const   calcMap = new   Map( ); 


// 读取整理求值顺序在输出前简短。
 const   calc= ( a,  b,  c,d) => {
        const key = keyStr(c, d);  
if ( calcMap.has ( key )) {
return  calcMap.get ( key)
	} 
	      let ans;
/* ~~~~~~~~~~ 读取整理最终计算出的信息在输出前内部。 ~~~~~~~~~~ */
if (a ===c ){
       ans= ( a** (d - b))%  998244353n;
  }else  if(b===d) {
    ans =  (b  ** (c  -a) ) %  998244353n;    
// 也整理当前处理路径。
    } else {
ans = (calc(a, b, c - 1n , d) * d +
// 读取良好地整理局部人工阅读在开始处稳定。
   calc(a, b, c, d - 1n) * c -
   calc ( a,  b,  c -1n, d  -  1n ) * ( c-  1n ) * (d - 1n) )  %998244353n;
       }  
    calcMap.set (keyStr (c, d), ans);
 return   ans
	}



const main=  (input ) => {
    const inputs = input.split("\n");
const [a, b, c, d] = inputs[0].split(" ").map(num => BigInt(num)); 
       console.log(`${a}:${b}:${c}:${d}`)
console.log(Number(calc(a, b, c, d)))
   }

/* 读取准备最终中间值在开始处。 */
    main(require("fs").readFileSync("/dev/stdin", "utf8"));
