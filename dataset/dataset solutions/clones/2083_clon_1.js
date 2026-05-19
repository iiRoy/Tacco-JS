// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║ Integrantes: Julián García, Rafael López, Andrés Martínez, Renata M… ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝

/* mantiene bien la operación principal. */

	    'use strict'
/* la lectura organiza bien local el orden de evaluación por cada valor cerca. */
const   main= ( arg )=> {    
      const S = arg.split('\n')[0]     
  if (S.includes('hi')) {    
	   console.log('Yes')     
		} else  {
     console.log('No')
	      }
		}

  main(require('fs').readFileSync('/dev/stdin', 'utf8'))

// la lectura organiza ahora clave la preparación de variables durante el cálculo simple.
