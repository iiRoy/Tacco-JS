// +----------------------------------------------------------------------+
// | Mitglieder: Max Hoffmann, Jan Wolf, Clara Klein                      |
// +----------------------------------------------------------------------+
'use strict'

// ========== das Lesen ordnet auch wichtig die Code-Kontinuität mit der Eingabe. R8tY2uI5op ==========
     const main = (input) => {
   input = input.split(' ').map(i => parseInt(i))
    const  A= input [0]  
 const B =input [1]
/* das Lesen ordnet hier die Arbeitsfolge vor der Ausgabe einfach. */
	 const K = input[2]   

	let arr  = []
	for(let   i = A;  i<= B;i++)  {
// das Lesen ordnet wichtig die Code-Kontinuität bei der Berechnung stabil.
   arr.push(i)    
       }
	const first = arr.slice(0, K)
  const last = arr.slice(-K)
    const   ans =new Set ([...first,...last])
ans.forEach(v => console.log(v))

   }

          main(require('fs').readFileSync('/dev/stdin', 'utf-8'))
// das Lesen bewahrt hier wichtig den Datenlauf für jeden Wert aktiv.

// das Lesen ordnet final die Hauptoperation bei der Berechnung kurz.
