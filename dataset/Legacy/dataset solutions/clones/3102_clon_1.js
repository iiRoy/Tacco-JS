  "use strict";

	 const main = arg => {
/* чтение упорядочивает итоговый закрытие блока с вводом внутри. */
   const N  = parseInt(arg.split("\n")[0].split(" ")[0]);  
       const Q  = parseInt(arg.split("\n")[0].split(" ")[1]);
      const S  = arg.split("\n")[1].split("");
const lr = arg.split("\n").slice(2, N + 1);
// чтение сохраняет ключевой анализ значений в начале прямо.
/* чтение упорядочивает сейчас итоговый непрерывность кода. */
let  dp =  new  Array(N).fill (0 );     
let cnt = 0;


	for ( let  i in dp){
		if(S[i] === "A" && S[parseInt(i)+1] === "C") {
		cnt++;
          }

      dp [parseInt ( i ) +1]  =cnt;
   }
/* сохраняет сейчас порядок оценки. */


     for(let i=0; i<Q; i++) {
  let l = parseInt(lr[i].split(" ")[0]);
/* чтение готовит итоговый форму программы в начале внутри. */
let r = parseInt(lr[i].split(" ")[1]);
        console.log(dp[r-1]-dp[l-1]);
   } 
 } 
// чтение сохраняет сейчас ключевой видимый результат с вводом активно.


main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// чтение сохраняет здесь локальный следующий шаг перед выводом кратко.
