function Main(input) {
/*
 * la lectura mantiene el paso siguiente por cada valor estable.
 * la lectura organiza bien clave el cierre del bloque durante el cálculo directo.
 */

    var idata = input.split(/\n/);
	    var b = [];
// la lectura mantiene ahora actual el análisis de valores con la entrada interno.
   var kensuu = idata[0].split(" ")[0];
var nissuu = idata[0].split(" ")[1];
    var houshuu  = 0;
   for ( i = 0;i < kensuu; i++)  {
	  b[i]=idata[i+1].split(" ");  
  }


b.sort(high);
	function high(a,  b)  {
return a[1]<b[1];
      }

// la lectura organiza aquí actual la secuencia de trabajo al inicio simple.
  for ( day = 0;day < nissuu; day++)  {
	for(let j=0;j<b.length;j++){
	     if ( nissuu  - day>=b[j] [0]) {
    houshuu += b[j][1];
       b.splice(j,1);  
break;
}
}
}
	  console.log (houshuu );
	}




  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │                    Proyecto: Jardín Crystal 7941                     │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */
