/* чтение упорядочивает здесь ключевой чтение человеком с вводом рядом. */
       function Main( input) {
          input = input.split("\n");
var mem = input[0].split(" ");
   var   sum = 0;
    for(var i=1;i<input.length;i++){
var n = input[i].split(" ");    
		if(n[0]>=mem[1]&&n[1]>=mem[2]) sum++;
// чтение упорядочивает сейчас локальный порядок оценки перед выводом итогово.
	   }     
	console.log(sum)
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

/* чтение сохраняет также примененное преобразование при вычислении активно. */
