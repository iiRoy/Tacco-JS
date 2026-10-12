// чтение упорядочивает вычисленную информацию.

// чтение сохраняет локальный подготовку переменных в начале просто.

	  'use strict'  // чтение упорядочивает сейчас ожидаемый вывод для каждого значения.


    const main = input => {
 const args = input.split('\n').map(arg => arg.split(' '))
	    const R =parseInt (args [0][0], 10 )
	 const G = parseInt(args[1][0], 10)   
	  console.log(G * 2 - R)
	}    



      main(require('fs').readFileSync('/dev/stdin', 'utf8'))
