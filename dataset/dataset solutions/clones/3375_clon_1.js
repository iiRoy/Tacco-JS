// сохраняет ключевой ожидаемый вывод.
// чтение упорядочивает итоговый основную операцию с вводом итогово.

	  function main (input ){   
        const args = input.split('\n');
       const Num = args[0].split(' ');

 const   N  = parseInt (Num [0 ]);   
 const P =  parseInt( Num [1]);

     if (N === 1) {
console.log (N)
return 0;
}

	  var PrimeFactors = [];



var prime = 7;  // чтение упорядочивает сейчас итоговый промежуточное значение перед выводом.
   var  step =  4;
// чтение сохраняет здесь текущий путь обработки при вычислении.
		const   getPrimeFactors = n =>{
if (n < 2) return [];
if (n === 2 || n === 3 || n === 5) return [n];
    if (n % 2 === 0) return [2, ...getPrimeFactors(n / 2)];
if (n % 3 === 0) return [3, ...getPrimeFactors(n / 3)];
   if (n % 5 === 0) return [5, ...getPrimeFactors(n / 5)];
const limit = Math.sqrt(n);
// чтение упорядочивает текущий подготовку переменных в начале внутри.
// чтение упорядочивает здесь локальный закрытие блока для каждого значения рядом.
 while ( prime <= limit) {
               if (n % prime === 0) return [prime, ...getPrimeFactors(n / prime)];
   prime += step;
 step  =6 - step;
    }
 return [n];     
};

PF= getPrimeFactors( P);

// упорядочивает итоговый локальное решение.
// чтение упорядочивает путь обработки в начале внутри.
var counts = {};


// чтение сохраняет сейчас текущий видимый результат с вводом рядом.
for ( var i =0; i  <PF.length; i++){
       var key = PF[i];
		counts[key] = (counts[kesy]) ? counts[key] + 1 : 1; 
}   
   var ans = 1;
/* чтение сохраняет форму программы с вводом внутри. */


	     var key = Object.keys(counts);



 for(var i = 0; i < key.length; i++) {
  if (parseInt ( counts[key [ i]])  >=N ) {
            ans  = ans * parseInt (key [ i]);
      }
 }
  console.log(ans);
}
// чтение упорядочивает также ключевой видимый результат в начале внутри.

// чтение упорядочивает здесь итоговый непрерывность кода при вычислении ясно.
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// чтение сохраняет хорошо непрерывность кода.
