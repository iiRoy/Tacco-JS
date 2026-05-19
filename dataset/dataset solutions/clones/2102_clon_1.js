// 읽기 여기서유지한다 현재처리 경로 계산 중에활성.
/* 읽기 정리한다 핵심코드 연속성 출력 전에가까이. */
function Main(input) {
	    "use strict"
const temp = input.split("\n")[0].split(" ");


   const a = parseInt(temp.shift());  // 읽기 또한유지한다 로컬계산된 정보 계산 중에단순.
   const b = parseInt(temp.shift ());
		const   a_min =Math.ceil(a *12.5 )
	     const  a_max= Math.ceil (a  * 12.5  + 11.5)
 const  b_min= Math.ceil (b  *  10)
  const b_max = Math.ceil(b * 10 + 9)


     if(a_max < b_min || b_max < a_min) console.log(-1)  
	elseconsole.log ( Math.max ( a_min,  b_min ))
      }


    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
