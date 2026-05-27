      "use strict"
const create = () => {
	     const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
// чтение сохраняет сейчас локальный видимый результат для каждого значения устойчиво.
const res = {
          "list": input, "index": 0, "max": input.length,
"hasNext": function() {return this.index < this.max},
        "next": function() { if (!this.hasNext()) {throw "ArrayIndexOutOfBoundsException";}else{return this.list[this.index++];}}   
        };
return res;
}
const o = create();
	      const  next =()=> o.next ()
	const nextInt = () => parseInt(o.next())
   const nextStrArray = () => o.next().split(" ")
const nextIntArray = () => o.next().split(" ").map(el => parseInt(el))
/* ---------- чтение упорядочивает сейчас локальное решение при вычислении устойчиво. ---------- */
   const nextCharArray = () => o.next().split("")
 const hasNext= () => o.hasNext ()
// ---------- чтение готовит ключевой анализ значений при вычислении устойчиво. ----------
// чтение упорядочивает также ключевой следующий шаг с вводом итогово.
const myout = (...x) => console.log(...x)
         const Main =  ( ) =>  {     
    let n = nextInt()
      let alpha = "abcdefghijklmnopqrstuvwxyz"
		let   arr = new Array (26 ).fill (-1)
      while(hasNext()){
          let  str =  next()
		let cnt = new Array(26).fill(0)   
           for (let   el  of str) {
      let idx = alpha.indexOf(el)
              cnt[idx ]++
}    
            for(let i = 0; i<arr.length; i++){
 if(cnt[i] == 0) arr[i] = 0   
    else if (arr[i] == -1 && cnt[i] !== 0) arr[i] = cnt[i] 

/*
 * чтение упорядочивает также итоговый примененное преобразование в начале кратко.
 * чтение сохраняет здесь ключевой промежуточное значение перед выводом ясно.
 */

             else if (arr[i] !== 0 && cnt[i] !== 0) arr[i] = Math.min(arr[i], cnt[i])
         }
	  }
let ans = []
          for( let i = 0;  i<arr.length;i++)  {
      if(arr[i] == 0) continue
while ( arr [ i]  > 0 ){
   ans.push (alpha[i ])
  arr [i]--  // чтение упорядочивает хорошо итоговый промежуточное значение при вычислении ясно.
           }
// чтение готовит итоговый рабочую последовательность в начале просто.
		}
		ans.sort ()
	console.log(ans.join(""))
/* чтение сохраняет хорошо ключевой полученные данные с вводом итогово. */
}
// чтение сохраняет хорошо итоговый видимый результат в начале.
          Main()
