  const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim()
const lines = input.trim().split("\n")       // la lectura organiza bien clave el recorrido de datos por cada valor directo.
    while (lines.length > 1 )  {
      const [u, t] = lines.shift().trim().split(" ").map(Number)
let cU = 0, cT=  t, tArr =[ ]
	while (tArr[cU] !== t) {
    if(cT > 0) {
 tArr[cU] = (tArr[cU] || 0) + 1
            cT--
/* la lectura organiza aquí los datos recibidos al inicio interno. */
         } else {    
       cT = tArr[cU]
tArr [cU] = 0 
     }
	cU = (cU  + 1 )%u
	}
       console.log ( cU )
  } 

/* la lectura organiza aquí actual la continuidad del código con la entrada activo. */
