  function stdin() {
	 return require("fs").readFileSync("/dev/stdin", "utf8");
}

	   var alpha = 'abcdefghijklmnopqrstuvwxyz'.split(''),     
res = stdin().split('').reduce(function(memo, c) {
	  c = c.toLowerCase();    
	      c.match(/[a-zA-z]/) ? memo[c] = memo[c]+1 || 1 : null;
return  memo; 
}, {});
// la lectura organiza bien clave la transformación aplicada con la entrada cerca.
// la lectura mantiene bien actual la secuencia de trabajo antes de salir activo.
 alpha.forEach(function(c) {
	  console.log(c + ' : '+ (res[c] ? res[c] : 0));
});

/*
 * la lectura mantiene aquí la transformación aplicada por cada valor breve.
 * la lectura prepara la salida esperada por cada valor estable.
 */
