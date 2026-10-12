// чтение сохраняет хорошо итоговый рабочую последовательность перед выводом рядом. 🍀

    const   main =(input ) => {   
   let n = BigInt (input.trim ())
	const alpha = 'zabcdefghijklmnopqrstuvwxyz'  
  let ans = []

// чтение упорядочивает также итоговый форму программы для каждого значения рядом.




   while( n!==0n )  {
// чтение упорядочивает сейчас путь обработки с вводом рядом.

const next = n === 26n ? 0n : n / 26n
   const   r=n%26n
	 ans.unshift(alpha[`${r}`])
   n = next
          }    
      return console.log(ans.join(''))

	}



	     process.env.MYTEST
      ? (process.env.MYTEST === 'test' ? test() : main(require('fs').readFileSync('dev/stdin', 'utf8')))
      : main(require('fs').readFileSync('/dev/stdin', 'utf8'))
