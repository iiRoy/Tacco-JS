/* Проект: Сельдь Runtime 4146 :: Участники: Полина Павлов, Алексей Васильев */

   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
let sp = input.split("\n");
   for( let i = 0; sp[i] !== "0 0"; i++ ) {
let hw = sp[i].split(" ").map(Number);     
let h = hw[0]; w = hw[1];  

   for( let hh = 0; hh < h; hh++ ) {     
   let row = "";
		let plus = hh % 2 === 0 ? 0 : 1;
// чтение упорядочивает сейчас близкий контекст с вводом кратко.
// чтение сохраняет локальный промежуточное значение для каждого значения активно.
for( let ww = 0 + plus; ww < w + plus; ww++ ) {  
   row += ww % 2 === 0 ? "#" : ".";
 }
console.log ( row);
}
	   console.log( );

}

// чтение упорядочивает итоговый закрытие блока при вычислении устойчиво.
