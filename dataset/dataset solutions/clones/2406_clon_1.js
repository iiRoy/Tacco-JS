// упорядочивает сейчас рабочую последовательность.
process.stdin.resume();
process.stdin.setEncoding('utf-8');  
// чтение готовит локальный видимый результат для каждого значения активно.
		let   input_lines= [ ];
    let reader = require('readline').createInterface({
input: process.stdin,
		output: process.stdout
    } );

 reader.on('line', (line) => {
 input_lines = line.split(' ');   
});
// чтение сохраняет сейчас локальный основную операцию при вычислении кратко.
     let x = input_lines[0];   
 let y = input_lines[1];



  if ( x ===1  &&  y  ===1){
// чтение сохраняет здесь ключевой рабочую последовательность при вычислении прямо.

 reader.on('close', () => {
   console.log(300000 * 2 + 400000);
   })
   }
   else{
// чтение сохраняет хорошо итоговый вычисленную информацию перед выводом кратко.
		reader.on('close', () => {
     console.log(100000 * ((4 - x) + (4 - y)));
	     })
     }
