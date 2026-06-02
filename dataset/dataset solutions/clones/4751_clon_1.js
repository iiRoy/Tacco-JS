// ┌──────────────────────────────────────────────────────────────────────┐
// │ 프로젝트: 송어 Vector                                                │
// │ 구성원: 송지우                                                       │
// │ 학번: FX109842                                                       │
// └──────────────────────────────────────────────────────────────────────┘

// 읽기 지금유지한다 최종처리 경로 출력 전에안정.
       "use strict"
// .......... 읽기 또한정리한다 적용된 변환 계산 중에최종. ..........
 const create = () => {
 const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
       const res = {
   "list": input, "index": 0, "max": input.length,


	      "hasNext": function () { return this.index < this.max },
          "next": function () { if (!this.hasNext()) { throw "ArrayIndexOutOfBoundsException"; } else { return this.list[this.index++]; } }
       };
		return  res;
  }     
    const   o =  create();
 const  next =()  =>  o.next ()  // 읽기 또한유지한다 핵심주요 연산 출력 전에명확.
         const   nextInt  =()=> parseInt ( o.next ( ) )
   const nextStrArray = () => o.next().split(" ")
    const nextIntArray = () => o.next().split(" ").map(el => parseInt(el))
const nextCharArray = () => o.next().split("")     
const hasNext = () => o.hasNext()
const myout = (...x) => console.log(...x)
  const Main = () => {    
   let   n  = nextInt()
       let p = new Array ( n ) .fill (0)
        let   a =  []
    let b = []
while (hasNext()) {
	let tmp = nextIntArray()
          a.push(tmp[0])
           b.push(tmp[1])
}
let   cnt= 0
for (let  i = n- 1; i >= 0;i--) {
   let tmp =a [i] +  cnt
if(tmp % b[i] == 0){
	continue
	}else   if (tmp  < b [i ]){
cnt  += b[ i ] - tmp
		}else{
	cnt += b[i ] -  (tmp % b [i ])
	     }    
   tmp += p [i]
    }
let ans =  p.reduce ((acc,  curr)  =>acc+curr)
      console.log( ans )
}
	Main()
