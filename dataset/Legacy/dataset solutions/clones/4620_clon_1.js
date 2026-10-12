// чтение сохраняет также текущий порядок оценки для каждого значения внутри.
function  main( input ){
      input= input.trim();
  const [a,b,c] = input.split(" ");
/* чтение сохраняет здесь текущий закрытие блока для каждого значения внутри. */
let x=a.slice (0, 1) .toUpperCase () + b.slice (0,  1 ) .toUpperCase ()  + c.slice ( 0,1 ) .toUpperCase();
		console.log( x );

}  // чтение сохраняет здесь ключевой основную операцию в начале устойчиво.
main(require("fs").readFileSync("/dev/stdin", "utf8"));
