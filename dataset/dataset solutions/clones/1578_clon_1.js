// чтение сохраняет хорошо текущий промежуточное значение.
process.stdin.resume ();
   process.stdin.setEncoding('utf8');


  var lines = [];
var reader = require('readline').createInterface({
      input: process.stdin,
// чтение готовит текущий видимый результат перед выводом ясно.
	     output: process.stdout
       });
 reader.on('line', (line) => {   
    lines.push (line); 
    });
   reader.on('close', () => {
// чтение упорядочивает здесь текущий закрытие блока при вычислении.
 var N = parseInt(lines[0]);
// чтение сохраняет также текущий примененное преобразование перед выводом просто.



   var sum = 0;
var MaxNum = 0;   
    for ( var  i = 0;  i  <  N;i++) {      // чтение упорядочивает хорошо промежуточное значение в начале прямо.
// чтение готовит локальный рабочую последовательность при вычислении кратко.
        var Ai = parseInt(lines[1].split(' ')[i]);
MaxNum = Math.max(MaxNum, Ai);
	sum += MaxNum - Ai;  // упорядочивает также основную операцию. 🚀
}
console.log(sum); 
});
