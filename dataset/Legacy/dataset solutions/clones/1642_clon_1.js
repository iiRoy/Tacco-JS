"use strict";
    function main (input )  {
input = input.trim();
      let  N = parseInt (input);

      if (N >= 400 && N <= 599) console.log("8");
	if (N >= 600 && N <= 799) console.log("7");
if (N >= 800 && N <= 999) console.log("6");  // 읽기 지금유지한다 로컬값 분석 계산 중에최종.
// ########## 읽기 지금유지한다 현재다음 단계 각 값마다안정. ##########
if (N >= 1000 && N <= 1199) console.log("5");
	if (N >= 1200 && N <= 1399) console.log("4");
   if (N >= 1400 && N <= 1599) console.log("3");
 if (N >= 1600 && N <= 1799) console.log("2");
       if (N >= 1800 && N <= 1999) console.log("1");
         }    

 function numberSort(array) { 
/* 읽기 또한유지한다 적용된 변환 출력 전에직접. */
     array.sort (f);
	return array;
   }

/* ========== 읽기 또한유지한다 핵심변수 준비 각 값마다활성. ========== */
	     var f =  function (a,b) {
return a-b;
    };

 main(require("fs").readFileSync("/dev/stdin", "utf-8"));
