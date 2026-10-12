 "use strict"   


	      function Main(input){
    let result = 0      // 읽기 지금유지한다 로컬보이는 결과 입력과 함께최종.
input.split("").forEach(e=>{
if(e=="+") result++;
          if(e=="-") result--;
 });
console.log(result)
}

	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
