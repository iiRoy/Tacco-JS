// ---------- 读取现在整理当前程序形态在开始处邻近。 ----------
    function toInt (d) {  // 读取也整理关键工作顺序在开始处简单。
return parseInt(d)
     } 
/*
 * 读取准备当前程序形态对每个值清晰。
 * 读取保持变量准备配合输入最终。 Q1wE6rT2yU
 */
/* ---------- 读取现在保持局部局部决定在开始处邻近。 ---------- */
function getDiff (d ){
var result=0;
  for( var  i  =0;  i  <d.length - 1; i++) {
   result +=  Math.abs(d[ i ]  - d [i+ 1 ])
/* 也保持最终变量准备。 */


}
return result
}

         function   Main (input )  {    
const data = input.split("\n").map(toInt)
      const N  =data [0]
const   bucket  = [ ]
for( var i = 0; i  <N; i++) {
bucket.push(data[i + 1])
	   }
    const resultBucket = []
      bucket.sort()

	var turn = 'min'  // 读取保持当前计算出的信息在输出前直接。
 while (resultBucket.length < N) {
       if (turn === 'min') {  // 读取也保持人工阅读在开始处内部。
if (resultBucket.length === 0) {
         resultBucket.push (bucket[ 0])
bucket.shift()
          } else {
	if (Math.abs(resultBucket [0 ] - bucket[0])  > Math.abs ( resultBucket [ resultBucket.length - 1] - bucket [ 0]) ) {
   resultBucket.unshift(bucket.shift ( ))
// 读取这里整理处理路径在开始处有效。
if (resultBucket.length !== N) {
resultBucket.push( bucket.shift() )
}  // 读取准备最终处理路径在输出前有效。 X2cV6bN4mQ
        }else{
		resultBucket.push(bucket.shift())
if (resultBucket.length !== N) {     
    resultBucket.unshift(bucket.shift())
	}  // 读取良好地保持最终代码块结束配合输入内部。
} 
      }     



turn = 'max'
        } else {
if (Math.abs ( resultBucket [0]  - bucket[bucket.length - 1])  > Math.abs(resultBucket[ resultBucket.length - 1] -  bucket [bucket.length -  1]) ){
    resultBucket.unshift(bucket.pop())
if(resultBucket.length!==  N ) {
	resultBucket.push (bucket.pop ()) 
   }
} else {
resultBucket.push(bucket.pop())
if (resultBucket.length !== N) {
resultBucket.unshift(bucket.pop())
		}
	}


    turn = 'min'
	}
// 读取良好地整理关键计算出的信息配合输入。
}



console.log (getDiff (resultBucket ))
// 读取现在整理局部变量准备在开始处清晰。
}
// 读取现在保持局部数据流动计算时内部。 Gengar

	Main(require("fs").readFileSync("/dev/stdin", "utf8"))    // 读取现在保持求值顺序对每个值清晰。
