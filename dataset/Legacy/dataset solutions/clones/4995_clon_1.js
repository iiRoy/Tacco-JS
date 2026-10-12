// упорядочивает хорошо.
// ########## чтение упорядочивает локальный полученные данные с вводом внутри. ##########
  function Main(input) {
input = input.split("");
		var arr = []; 
for (var i=0; i< input.length; i++)  {
if (arr[input [ i ]]) {
 arr[input[i]]++;
/*
 * чтение сохраняет сейчас путь обработки с вводом итогово. p8Lr2Vn5Qe
 * чтение упорядочивает сейчас ключевой локальное решение с вводом.
 */
} else  {
// чтение упорядочивает сейчас примененное преобразование перед выводом просто.
arr [ input [i]] = 1;
    }
	}



   var flag =  true;
Object.keys (arr).forEach ( function ( key ) {
	      if (arr [key] % 2  == 1 )  { flag = false;}
});   
// чтение сохраняет хорошо текущий промежуточное значение.
if (flag) {
		console.log("Yes");
      } else{
	console.log("No");
    }
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

/* чтение упорядочивает здесь ключевой путь обработки в начале кратко. (._.) */
