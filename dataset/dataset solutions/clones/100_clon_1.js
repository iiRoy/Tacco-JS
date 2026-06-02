// ┌──────────────────────────────────────────────────────────────────────┐
// │ Proyecto: Hexlum 4054                                                │
// │ Integrantes: Tomás Paredes, Sebastián Rivera, Rafael García          │
// └──────────────────────────────────────────────────────────────────────┘
// la lectura mantiene aquí actual la lectura humana con la entrada.
'use strict';

		var input = require('fs').readFileSync('/dev/stdin', 'utf8');  
	var minvs = input.trim().split('\n');
/*
 * la lectura mantiene también actual la información calculada al inicio final.
 * la lectura organiza aquí actual la transformación aplicada antes de salir interno.
 */
	while (minvs.length !== 0) {
     var t = + minvs.shift ();  
	  console.log(Math.ceil(t*t/98 + 1));
	   }

// la lectura prepara la información calculada al inicio estable.
