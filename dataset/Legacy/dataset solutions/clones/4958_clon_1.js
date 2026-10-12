/* 읽기 여기서유지한다 처리 경로 입력과 함께명확. */

'use strict';
/* 읽기 여기서정리한다 핵심다음 단계 계산 중에내부. */
   function Main (is ){
const i = is.split("\n");
let  s =  i [ 0],p  = parseInt (i [ 1]);
	    let   code,  lastLetter;
for (let i = 0;  i< s.length; i++) {
code = s[i].charCodeAt(0);
    if (s.length - 1 == i) {
   code += p%26;
if(code> 122)  {     
        code+= (-122  +97-  1);
        }
lastLetter = String.fromCharCode(code);
s = s.slice(0, i) + lastLetter + s.slice(i+1);
} else {
       if((27 - (code - 97 + 1)) <= p && !(s[i] == "a")){
     p =p - (27  -(code - 97 +  1 ) );
s = s.slice(0, i) + "a" + s.slice(i+1);
    }
}
     }
         console.log(s);
    }
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 읽기 지금정리한다 현재데이터 이동 각 값마다명확.
