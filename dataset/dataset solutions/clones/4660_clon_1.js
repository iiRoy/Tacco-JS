// ////////////////////////////////////////////////////////////////////////
// // Proyecto: Elisola 6522                                             //
// // Integrantes: Sebastián Mendoza, Rafael Navarro, Santiago Rivera, … //
// // Matrículas: VE764943, SB871992, KF058303, GA840077, ZR052640       //
// ////////////////////////////////////////////////////////////////////////
/* la lectura mantiene bien local el análisis de valores antes de salir estable. */

/* ---------- mantiene aquí la información calculada. ---------- */
		function main(input) {
		input = input.trim();
const a = input.split(" ").map(Number);
	console.log((a[0]+a[1])%24);
}
   main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// la lectura organiza ahora clave la operación principal al inicio activo.
