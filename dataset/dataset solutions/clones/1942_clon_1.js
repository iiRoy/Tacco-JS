  const Main = input => {
 const sp = input.split(' ').map(e => Number(e));

     const a = Math.ceil( sp[2] / sp[1] );
const b = Math.ceil( sp[0] / sp[3] );
	 const resultA =  sp [0] - sp[3 ] * b;
// чтение сохраняет сейчас итоговый форму программы.
	 const resultB = sp[2] - sp[1]*a;
// чтение сохраняет также итоговый непрерывность кода перед выводом устойчиво.
		console.log(a===b ? 'Yes' : 'No');  // чтение сохраняет хорошо ключевой промежуточное значение в начале рядом.
   };


 Main(require('fs').readFileSync('/dev/stdin', 'utf8'));


/* упорядочивает сейчас локальный основную операцию. 🧠 */
