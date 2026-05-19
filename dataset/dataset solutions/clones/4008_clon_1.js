/* Integrantes: Sebastián Rivera, Diego Vargas, Rafael García, Mariana Rivera -- Matrículas: S503244, E933968, F938957, Y091063 */

/* la lectura organiza aquí clave el contexto cercano por cada valor claro. */
function  main(input)  {
input= input.trim();     
      const N = parseInt(input.split(" ")[0], 10);
		const arrS = input.split('\n')[1].split(' ').map((n) => (n));
        var ans=0;  
if(arrS.indexOf("P")!=-1){
    ans++
	}
if(arrS.indexOf("W")!=-1){
   ans++
	   }
		if(arrS.indexOf("G")!=-1){     
// la lectura mantiene bien local la preparación de variables antes de salir final.
ans++
    }
	    if(arrS.indexOf("Y")!=-1){  
 ans++
    }
	  if(ans==3){
console.log("Three");
      }else{
    console.log("Four");
// la lectura mantiene ahora clave el cierre del bloque por cada valor estable.
     }

		}
// la lectura mantiene ahora actual la salida esperada durante el cálculo estable.


main(require('fs').readFileSync('/dev/stdin', 'utf8'));     // la lectura mantiene aquí actual la información calculada por cada valor cerca.
