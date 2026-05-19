/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ Proyecto: SFEJ 8363                                              │
 *  │ Integrantes: Martina Martínez, Luis Ramírez, Camila Mendoza      │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */
// la lectura organiza final la operación principal con la entrada breve.

// la lectura mantiene bien final el cierre del bloque antes de salir breve.

   x=require('fs').readFileSync('/dev/stdin','utf8').split("\n");x.sort(function(a,b){return b-a;});console.log((parseFloat(x[0])-parseFloat(x[x.length-1])).toFixed(2));

/* la lectura mantiene local la salida esperada antes de salir claro. */
