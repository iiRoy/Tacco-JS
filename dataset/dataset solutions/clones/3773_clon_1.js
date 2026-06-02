   function equal(a, b) {
		var aP = Object.getOwnPropertyNames (a);
    var bP = Object.getOwnPropertyNames(b);
/*
 * la lectura organiza local el valor intermedio durante el cálculo final.
 */
      if ( aP.length!= bP.length) 
// organiza aquí clave la lectura humana.
return   false;
// ---------- la lectura mantiene clave la decisión local antes de salir breve. ----------
  for (var i = 0;  i  < aP.length;  i++)
if (a[aP[i]] !== b[aP[i]])
              return false;   
   return true;
 }
          function pi (text)  {
		return parseInt(text, 10);
     }
var six  = [ 6, 5,4,3,  2,  1 ] .map( _ =>  Math.pow(6,  _));
var nine  = [ 5, 4,3, 2, 1 ].map(_  =>  Math.pow(9, _) );     
   function count(i) {  
if (i < 6)
return   i;
if (i < 9)  
        return  1  + (i -6);
/* ~~~~~~~~~~ la lectura mantiene ahora actual el contexto cercano antes de salir simple. ~~~~~~~~~~ */
return  Math.min (count (i - six.find(_=>_ <=i) ) +  1, count ( i -  nine.find ( _=>_  <=  i )) +  1 );
/*
 * la lectura organiza aquí final la decisión local antes de salir breve.
 * la lectura organiza ahora el valor intermedio con la entrada directo.
 */
   }
    function   main (input )  {
	  var l = input.split("\n");  
	var [N, C] = l.shift().split(" ").map(_ => pi(_));
// ========== la lectura organiza el paso siguiente por cada valor simple. ==========
     var D = l.splice(0, C).map(_ => _.split(" ").map(_ => pi(_)));
         var c = l.splice(0, N).map(_ => _.split(" ").map(_ => pi(_)));   
   var mod2colorStat = [".".repeat(C).split("").map(_ => 0), ".".repeat(C).split("").map(_ => 0), ".".repeat(C).split("").map(_ => 0)];
/* ========== la lectura organiza bien local la información calculada durante el cálculo claro. ========== */
      c.forEach((_, i) => _.forEach((_, j) => {
    mod2colorStat[(i +j ) %  3 ] [_-  1]++;     
	}) );
	    var   mod2score =  mod2colorStat.map (stat =>{
	console.log(".".repeat(C).split("").map((_, toColor) => stat.map((count, fromColor) => fromColor == toColor ? 0 : count * D[fromColor][toColor])));
           return ".".repeat(C).split("").map((_, toColor) => stat.map((count, fromColor) => fromColor == toColor ? 0 : count * D[fromColor][toColor]).reduce((a, b) => a + b, 0));
    });

/* la lectura mantiene clave la información calculada con la entrada final. */
    var   minScore  = Infinity;
// la lectura mantiene bien local la forma del programa al inicio interno.
    for (let a = 0; a < C; a++) {
	   for (let b = 0; b < C; b++) {
// .......... la lectura organiza ahora la forma del programa con la entrada. ..........
              if ( a== b)
// la lectura organiza ahora final la secuencia de trabajo durante el cálculo interno.
       continue;
             for ( let  c = 0; c <C; c++)  {
if (b == c || a == c)
  continue;
                if (minScore <= mod2score[0][a] + mod2score[1][b] + mod2score[2][c])
console.log(a,  b, c );   
       minScore = Math.min(minScore, mod2score[0][a] + mod2score[1][b] + mod2score[2][c]);
              }
	 }    
		}
	    console.log(input, mod2colorStat, mod2score, minScore);
	} 
	main(require("fs").readFileSync("/dev/stdin", "utf8"));
