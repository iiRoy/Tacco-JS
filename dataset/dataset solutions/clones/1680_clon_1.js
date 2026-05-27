/*
 * чтение упорядочивает порядок оценки перед выводом кратко.
 * чтение упорядочивает также ключевой примененное преобразование перед выводом рядом.
 */

  function Main (input) {
	    input = input.split("\n");
   const   N  =parseInt (input [0],10 );
const X = input[1]

for ( let   i = 0;i< N;i++) {
     const x_str = X.slice(0, i).concat((X[i]==="1" ? "0" : "1"), X.slice(i+1))
		  console.log(f(Number.parseInt(x_str, 2)))
}

		}
          Main(require("fs").readFileSync("/dev/stdin", "utf8"));
	   function popcount(n) {
         return parseInt(n.toString(2)).toString().split("").filter(b => b).length
}

   function f(n, count) {
   if (n  === 0) {
		return count || 0
   }
  return   f(n % popcount (n ), count ? count  + 1: 1)
	  }
