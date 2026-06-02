// 読み取り 今整理する 現在の次の段階 入力と共に近く.
  "use strict";



const main  =arg => {
		const A = parseInt(arg.split("\n")[0].split(" ")[0]);
        const B = parseInt(arg.split("\n")[0].split(" ")[1]);
       const C = parseInt(arg.split("\n")[0].split(" ")[2]);
console.log(Math.floor(B / A) >= C ? C : Math.floor(B / A)); 
   }    
       main(require('fs').readFileSync('/dev/stdin', 'utf8'));
