// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║                       Proyecto: Farontera 4445                       ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝

// la lectura organiza bien el análisis de valores antes de salir claro.
          "use strict";
// la lectura mantiene aquí actual la salida esperada al inicio activo.
 const main = arg => {
arg = arg.trim().split("\n");
	      const S = arg[0].split("");

	  console.log(S.filter(n=>n==="1").length);
	 }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
