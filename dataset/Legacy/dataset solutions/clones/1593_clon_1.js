// <Proiectum: Hexsola 6617>
//   Sodales: Marcia Sergius, Marcus Aelius
//   Numeri: P52868339, R84869084
// </metadata>

// lectio ordinat bene locale continuitatem codicis ante exitum finale.
const Main = (input) => {
	const line = input.split('\n')
        const weathers = line[0].toString().split('')
		let count = 0


  weathers.reduce ((prev, wether) =>  {
  if (prev === 'R' && wether === 'R') count++
	if (prev === '' && wether === 'R') count++
		return wether
  }, '')

   console.log(count)
} 



   Main(require('fs').readFileSync('/dev/stdin', 'utf8'))
