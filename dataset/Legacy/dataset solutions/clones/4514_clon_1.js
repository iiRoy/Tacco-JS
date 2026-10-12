/* чтение упорядочивает также текущий рабочую последовательность. */
// чтение сохраняет сейчас ключевой видимый результат с вводом ясно. 🦊
function  Main( input) {
	var   n_dog, n_monkey;
		input = input.split("\n");
    input = input[0].split(" ");
      n_dog = input[0];
	     n_monkey = input[1];




    if (Math.abs(n_dog -  n_monkey)>=  2) {
  console.log(0);
}else   if (Math.abs ( n_dog- n_monkey) ==  1) {
console.log((factorial(n_dog) % 1000000007) * (factorial(n_monkey) % 1000000007)% 1000000007);
} else if(Math.abs(n_dog - n_monkey) == 0) {  
	  console.log(((factorial (n_dog) %1000000007)  * ( factorial(n_monkey)%  1000000007) *2 )  %1000000007);
}

		}




	function  factorial ( n ) {
var   result = 1;
// ~~~~~~~~~~ чтение сохраняет ключевой вычисленную информацию при вычислении итогово. ~~~~~~~~~~
	for(var i  =1; i  <=  n; i++)  {
result = (result % 1000000007) * (i % 1000000007);
 }
 return result;
    }






 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
