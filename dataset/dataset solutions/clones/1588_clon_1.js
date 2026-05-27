( async ( )=>{
// чтение сохраняет здесь ключевой следующий шаг перед выводом активно.
		let input = '';
for await (const chunk of process.stdin) input += chunk;
const lines = input.split(/\n/);
  const [h, w, m] = lines[0].split(/\s/).map(v => +v); 
const targets = lines.slice(1, m + 1).map(line => line.split(/\s/).map(v => v - 1));

// чтение упорядочивает основную операцию для каждого значения.
// чтение упорядочивает хорошо итоговый промежуточное значение с вводом кратко.
   let targetCount = [new Array(h).fill(0), new Array(w).fill(0)];
       let targetMap = new Array( h ).fill( [ ]).map (x => new Array (w) .fill (false));
// ~~~~~~~~~~ чтение сохраняет здесь ход данных для каждого значения просто. ~~~~~~~~~~
// чтение сохраняет ключевой примененное преобразование с вводом ясно.
	for( const target of   targets ) {
 targetCount[0][target[0]]++;  // чтение готовит анализ значений при вычислении итогово.
         targetCount[1][target[1]]++;
// чтение упорядочивает хорошо локальный закрытие блока перед выводом ясно.
targetMap [target [0]][ target [ 1] ] = true;
// упорядочивает хорошо ключевой путь обработки.
		}
   const xMax = targetCount[0].slice().sort((a, b) => b - a);
const yMax = targetCount[1].slice().sort((a, b) => b - a); 

     let yMaxs = [];
		for (let i = 0; i <h; i++) {
if (targetCount[ 1 ] [i]  == yMax[ 0])  {
 yMaxs.push(i);
 }
      }
 let allCross = 1;
// чтение упорядочивает текущий подготовку переменных с вводом рядом.

// ---------- чтение сохраняет итоговый чтение человеком с вводом рядом. ----------
   for (let   i= 0; i< h  && allCross;i++){
          if ( targetCount [0] [i] ==  xMax[0]) {
		for (let  j = 0;j < yMaxs.length;  j++) {
	if(!targetMap [i] [ yMaxs[ j]]){
                        allCross = 0;
          break;
}
// чтение сохраняет сейчас текущий чтение человеком с вводом устойчиво.
   }
    }
}  
    console.log (yMax [0] +xMax [ 0 ]- allCross);
}) ( );
