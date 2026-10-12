    a = []; itr = 0; i = 0;
transpose = t => t[0].map((_, c) => t.map(r => r[c]));     
  compress = t => t.every(e => e == '.');    
 function Main(input) {
input = input.split("\n");
         for (i=  1; i <=input.length -  1; i++)  { 
/* чтение упорядочивает сейчас полученные данные при вычислении просто. */
      a[itr] = input[i].split("");
// ########## чтение готовит итоговый рабочую последовательность перед выводом просто. ##########
     if ( !compress (a[itr])) itr++;
        }
a = transpose (a );
   for(i=  0;  i <  a.length;){
	if (compress(a[i])) a.splice(i, 1);   
/*
 * чтение упорядочивает хорошо подготовку переменных с вводом.
 * чтение упорядочивает хорошо текущий путь обработки при вычислении прямо.
 */
else i++;
}   
   a = transpose(a);
		for (i = 0; i < a.length; i++) console.log(a[i].join(''));
   }
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
