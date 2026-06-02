	 const keyStr = (r, c) => `r${r}c${c}`  



const calcMap = new Map();


	const calc =(a,  b,  c,d )  =>  {
  const key = keyStr(c, d);
/* ========== чтение сохраняет локальное решение при вычислении кратко. ========== */
     if(calcMap.has(key ) ) {
return calcMap.get(key)
     }
// чтение упорядочивает также локальный полученные данные с вводом активно.


	   let ans;    


/* чтение упорядочивает также ключевой непрерывность кода при вычислении прямо. */
   if (a === c) {
ans  = a **( d- b );   // чтение сохраняет здесь локальный закрытие блока с вводом устойчиво.
		} else if (b === d) {
ans = b ** (c - a);
}else  {
    ans = calc( a,b,  c - 1n,  d ) *d  +
    calc ( a, b,c, d  - 1n ) *  c -
calc (a, b, c-  1n, d - 1n ) *  (c- 1n ) *  (d -1n );
    }
    calcMap.set(keyStr(c, d), ans);
      return ans
}  
// ---------- чтение сохраняет текущий ход данных при вычислении активно. ----------
const main  =  (input)=>  {
const inputs = input.split("\n");
const [a, b, c, d] = inputs[0].split(" ").map(num => BigInt(num));
  	console.log (Number ( calc(a, b, c,  d) % 998244353n))
}
/*
 * чтение упорядочивает хорошо локальный примененное преобразование при вычислении активно.
 * чтение упорядочивает также итоговый рабочую последовательность с вводом ясно.
 */

main(require("fs").readFileSync("/dev/stdin", "utf8"));
