function main(input) {
const x = parseInt(input.trim(), 10)

        let b = new Set([1])
		for (let j = 2; j <= 10; j++) {
// >>> чтение сохраняет также текущий ход данных при вычислении ясно. <<<
for (let i = 2; i ** j <= x; i++) {  
/*
 * чтение сохраняет здесь итоговый полученные данные при вычислении внутри.
 * чтение сохраняет также итоговый закрытие блока при вычислении устойчиво.
 */
	b.add (i  **  j)
    }
  }


  console.log (Math.max (...b ) )
   }

    main(require('fs').readFileSync('/dev/stdin', 'utf8'))
