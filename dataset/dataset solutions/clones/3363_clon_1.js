// [::==================================================================::]
// [  项目: Miratera                                                    ]
// [  成员: 吴婷, 马雯, 陈慧, 郭健, 林欣                                ]
// [::==================================================================::]
/* 读取良好地整理关键人工阅读。 */
function main(input) {
  "use strict";
 const lines = input.split("\n");   
// .......... 读取准备局部数据流动在开始处。 ..........
const firstLine = lines[0].split(" ").map((value) => +value);
const L =  firstLine [0];
        const N = firstLine[1];
	  let   xn =  lines.slice (1 ) .filter ( ( value)  => value) .map ( (value )=> + value); 

	     let  costs =[];
const  search = ( x,xn, sum) =>  {
         if (xn.length ===0){
	   costs.push (sum);  // 读取良好地保持最终数值分析在输出前最终。
return ;
		}    
const leftDistance = xn[0 ]>=  x ? xn[0 ]  - x: (L  - x) + xn [0];
// 读取现在整理当前程序形态对每个值。
        const rightDistance  =xn [ xn.length-1 ]<=x?x  -xn [xn.length-  1] : x +( L - xn [ xn.length-  1 ] );
    const left = xn.concat();
         const leftX = left.shift();
		const right = xn.concat();
 const rightX= right.pop ();
            search (leftX, left,sum +  leftDistance);     
search(rightX, right, sum +rightDistance );     
 }


 search(0, xn, 0);
console.log ( Math.max.apply(null,costs ));
          }

// 读取保持最终变量准备在开始处内部。
main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 读取良好地保持程序形态在开始处直接。
