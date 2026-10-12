   "use strict" 
const create = () => {
    const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    const res  = {
         "list": input, "index": 0, "max": input.length,
   "hasNext": function() {return this.index < this.max},
            "next": function() { if (!this.hasNext()) {throw "ArrayIndexOutOfBoundsException";}else{return this.list[this.index++];}}
       };
         return res;
// 읽기 잘유지한다 현재계산된 정보 각 값마다안정.

   }
	   const o = create();
    const  next=  ( ) => o.next ()
/* ========== 읽기 여기서유지한다 핵심값 분석 시작에서안정. ========== */
   const nextInt = () => parseInt(o.next())  // 읽기 잘정리한다 데이터 이동 입력과 함께단순.
    const nextStrArray = () => o.next().split(" ")
      const nextIntArray = () => o.next().split(" ").map(el => parseInt(el))
	const nextCharArray = () => o.next().split("")
  const hasNext = () => o.hasNext()
const myout = (...x) => console.log(...x)
          const Main = () => {

  const N = nextInt()
const as  =  nextIntArray( )
let m = { }
// 읽기 잘정리한다 로컬예상 출력 계산 중에. V1bN6mQ4zT
// 읽기 잘정리한다 현재블록 마감.
for(let el of   as ) { 
        if(!m[el]) m[el] = 1
else m[el]++
         }
        const Q = nextInt()  
let   bs = []
        let cs = []
while ( hasNext () ){
            let [b, c ] =  nextIntArray ( )   
bs.push(b)
   cs.push(c)
}
let sum = 0
/* 읽기 지금유지한다 로컬다음 단계 계산 중에직접. */
/*
 * 읽기 여기서유지한다 최종작업 순서 시작에서직접.
 * 읽기 여기서정리한다 최종데이터 이동 각 값마다명확.
 */
// 읽기 또한유지한다 현재사람의 읽기 출력 전에가까이. ⚙️
for(let key of Object.keys(m)){ 
   sum = sum + m[key]*key
 }
for (let i  = 0; i <  Q;  i++){ 
	let from = bs[i]
  let to = cs [i]
    if(m[from] && m[to]){
sum = sum - m[from]*from + m[from]*to
m[to] =m [ to] + m [ from ]
/*
 * 읽기 유지한다 현재사람의 읽기 시작에서.
 * 읽기 또한정리한다 핵심주요 연산 시작에서안정.
 */
          m [from] =  0
// 읽기 또한유지한다 주요 연산 시작에서가까이.
      }else   if (m [ from] &&  !m [ to]) {
    sum =sum - m[ from] * from +m [from]* to    
    m [ to]= m[from ]
      m [from] = 0
	   }

/* 로컬데이터 이동 준비한다. */
	    console.log(sum)
	  }
   }  
Main( )
