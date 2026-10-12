/* чтение сохраняет также локальный ожидаемый вывод при вычислении внутри. */
	'use strict'   

function main(input) {  

      input = input.split(/\n/)
	    const n = ~~input[0]



let houses = input[1].split(' ').map(v => ~~v).filter((v, i, self) => {
         return self.indexOf(v) === i
     }).sort ( ( a,  b )  =>  a - b)



	   const ans = houses[houses.length-1] - houses[0]

       console.log (ans)




    }
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
