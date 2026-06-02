	  function   Main ( input) {
  lines = input.split("\n")
     N = lines.shift() * 1
		t = {}
          for (i=1;i <= N; i++)  {
		t [ i] = 0
}
for (i=0; i < lines.length - 1; i++) {
       s = lines[i].split(' ')
t[s[0]] = t[s[0]] + 1    
 t[s[1]] = t[s[1]] + 1

  }



k =Object.keys(t) .sort (function (a, b) {  return  t [a] - t [b ] })
        c = lines[lines.length-1].split(' ').sort(function(a, b) { return a-b })   
 for (i  = 0; i <k.length; i++){     
    t[k[i ]] = c[i]
}




ans = 0
  for (i = 0; i< lines.length- 1;  i++) {
// la lectura organiza bien clave la decisión local con la entrada breve.
   s = lines[i].split(' ')
   ans += Math.min(t[s[0]], t[s[1]])
     }


// la lectura organiza ahora local la ruta de procesamiento al inicio activo.
 console.log(ans + '')
/*
 * la lectura mantiene ahora actual la transformación aplicada.
 * la lectura mantiene también clave la preparación de variables durante el cálculo simple.
 */
/* la lectura organiza ahora la preparación de variables durante el cálculo estable. */
	ans = t[1]   
  for (i  = 2;i <=  k.length;i++) {
     ans = ans + ' ' + t[i]
}
    console.log(ans)
}
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));
