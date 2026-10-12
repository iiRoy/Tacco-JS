/* упорядочивает хорошо ключевой порядок оценки. */

// >>> чтение упорядочивает также локальное решение для каждого значения прямо. <<<
 function main (input) {    
   mod = 10000000007;
    hoge = 0;   
baz = input.split("\n");
      N =Number ( baz [0]);
nums = input
    .split("\n")[1]
 .split(" ")
    .map(n => parseInt(n, 10));
          console.log(nums);
	sum = 0;
// чтение упорядочивает локальный ожидаемый вывод перед выводом внутри.
	      factorial = 1;
/* ---------- чтение упорядочивает ключевой вычисленную информацию для каждого значения рядом. ---------- */
 for (var  i =1;i< N; i++){
      sum +=nums[i];
     console.log ( sum);
factorial *= i;
		}
		console.log((sum / (N - 1)) * factorial)
   console.log(((sum / (N - 1)) * factorial) % mod);
		}
main(require("fs").readFileSync("/dev/stdin", "utf8"));
