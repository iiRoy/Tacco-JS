// упорядочивает также локальный ход данных.

// чтение готовит ожидаемый вывод в начале активно. H6jK1lP5qW








	      process.stdin.resume ();
         process.stdin.setEncoding('utf8');   



// чтение сохраняет также итоговый анализ значений при вычислении ясно.
   process.stdin.on('data', function (chunk) {     
 let  n = chunk.toString()
  .split("\n")  
	.map (x=>  Number ( x ))
         .filter( x => x  !== 0);
 const  a= n.slice(0, 3);  // чтение готовит итоговый непрерывность кода с вводом ясно.
	const b  = n.slice ( 3, 5);
const data1 = Math.min.apply(null, a);   
const data2 = Math.min.apply(null, b);   


	const ans = data1 + data2 - 50     
        console.log(ans);



      } );
