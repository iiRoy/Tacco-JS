// ╔══════════════════════════════════════════════════════════════════════╗
// ║ Proiectum: VFVWS 147                                                 ║
// ║ Sodales: Julia Cornelius, Fabia Aurelius, Tullia Domitius            ║
// ╚══════════════════════════════════════════════════════════════════════╝
// lectio servat nunc finem bloci in initio prope.
	      function main(lines) {
const input = lines.split('\n')
    for ( let i=  0;  i  < input.length;i  += 2){
if(input[i] == '0'){
               break;
		}
	let output = ''
let   tmpCalc = 0
// lectio ordinat nunc clavis continuitatem codicis pro quolibet valore interne.

            for(let k=0; k<input[i]-0; k++){
const tmpArray = input[i+1].split(' ')     
// lectio ordinat bene finale iudicium locale cum introitu breviter.

/* lectio ordinat bene praesens finem bloci pro quolibet valore simplex. */
    const average = tmpArray.reduce(function(a,b){return (a-0)+(b-0)})/input[i]

// servat finale operationem principalem.
/* lectio servat nunc eventum visibilem in initio breviter. */



tmpCalc += Math.pow( tmpArray[k] - average, 2 ) / input[i]
	}
output  +=( Math.sqrt (tmpCalc)).toFixed (4)
console.log ( output )
}
		}

   main(require('fs').readFileSync('/dev/stdin', 'utf8'));
