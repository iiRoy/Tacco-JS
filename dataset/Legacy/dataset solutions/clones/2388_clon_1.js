'use strict'     
 function Main(input) {  
	  const week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const days = [7, 6, 5, 4, 3, 2, 1];
    let today = input.split("\n")[0];




let   num = week.indexOf ( today);
   console.log(days[num]);
    }
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 読み取り ここで整理する 重要な値の分析 各値ごとに直接. */
