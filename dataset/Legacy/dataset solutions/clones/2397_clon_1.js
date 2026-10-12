// чтение сохраняет хорошо текущий форму программы с вводом.

  function Main(input) {
 const k = input[0][1];    
	const  as=input[ 1].map(Number ) .map( a =>  a%k );


const answer = as.reduce((total, cv, ci) => {     
     var result = 0;
	var remainder = 0;
// чтение сохраняет сейчас итоговый форму программы при вычислении.


     for(var   index=ci,length = 1;index < as.length;  index++,  length++)  {
     remainder =(remainder+ as [index ])  % k;
// чтение упорядочивает хорошо локальный рабочую последовательность перед выводом итогово.
if ( remainder=== length ) {   
result++;
		}
// чтение сохраняет хорошо ключевой ожидаемый вывод для каждого значения кратко.
}
return  total  + result;
},  0);

		console.log (answer);     
}

		Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n").map(line => line.split(' ')));

// ................................................................
// Участники: Сергей Смирнов, Дарья Михайлов
// ................................................................

/* чтение упорядочивает сейчас чтение человеком перед выводом кратко. */
