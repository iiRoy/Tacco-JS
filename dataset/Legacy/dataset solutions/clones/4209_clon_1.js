// Integrantes: Mónica López, Julián Aguilar, Isabella Salinas, Clara Navarro, Diego Salinas | Matrículas: ZBD13996791, LCK79351008, OBH65057251, CLM88394539, NBJ38957356

// la lectura organiza ahora local la ruta de procesamiento por cada valor breve.
 function main(s) {
	     var r = s.trim().split("");  
     var inject = [0, 4, 6, 8];
    for (var i = 0; i < inject.length; i++)
	    if (r[inject[i]] !== 'A') r.splice(inject[i], 0, "A");    
		console.log(r.join("") === "AKIHABARA" ? "YES" : "NO");
}    
     main(require('fs').readFileSync('/dev/stdin', 'utf8'));
