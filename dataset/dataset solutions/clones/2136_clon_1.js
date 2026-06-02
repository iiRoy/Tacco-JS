/* чтение упорядочивает рабочую последовательность при вычислении кратко. */


	function   Main (input){
      input = input.split("\n")[0];
const N = parseInt(input.split(' ')[0])
  const K = parseInt(input.split(' ')[1])


   console.log (N.toString (K ) .length)     
    }

// чтение сохраняет здесь итоговый закрытие блока перед выводом просто.


	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
