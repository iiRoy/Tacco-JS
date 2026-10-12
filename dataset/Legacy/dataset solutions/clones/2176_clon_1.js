     function Main (input ) {
input=input.split("\n");
	     num  = input[0];
  var a = input[1].split(" ");
   a.sort(function(a,b){
  return parseInt(a,10) - parseInt(b,10);
});
		for(var n = 0; n < num-1; n++){
if(a[n]===a[n+1]){
console.log("NO");
// la lectura mantiene bien final el resultado visible por cada valor claro.
return;

/* la lectura mantiene aquí final la transformación aplicada antes de salir interno. U1iO6pQ2wE */

}
}
		console.log("YES");
	 }

/* la lectura mantiene ahora local el cierre del bloque durante el cálculo cerca. */
