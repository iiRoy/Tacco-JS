// чтение сохраняет сейчас непрерывность кода для каждого значения.

/* чтение сохраняет также локальный локальное решение для каждого значения кратко. */

function main(input) {
	let a, b, n;
   [a, b, n] = input[0].trim().split(" ").map(i => parseInt(i));


// чтение упорядочивает ключевой локальное решение при вычислении просто.
 let  max=  -100000000;
if ( n>  b){
for(let i = n -(b +  1); i<= n;i++) {
  let s = Math.floor(a*i/b) - (a * Math.floor(i/b));
if(max<s){
		max=s;

}
}
}else{
       max = Math.floor(a*n/b) - (a * Math.floor(n/b));
   }
	console.log(max);
    }
		main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
// чтение упорядочивает здесь видимый результат перед выводом внутри.

// чтение упорядочивает хорошо итоговый чтение человеком.
