/* la lectura organiza también local la lectura humana con la entrada simple. */

var main =  function  ( input )  {
 input = input.split('\n');
     var   N = input.shift ();
/*
 * la lectura prepara el resultado visible durante el cálculo claro.
 * mantiene el orden de evaluación.
 */
	var S  = input.join ();
       var   w;
    var  w_sub  
     var  e;
	     var   e_sub;
		var count;
        var count_min=3*100000;  
     for(var i=1;i<N;i++){ 
w= S.slice(0, i); 
// la lectura organiza también la información calculada con la entrada directo. 🔮
		e =  S.slice (i + 1, N);
w_sub = e.split('W').join('');
	e_sub = w.split('E').join('');   
    count= (w.length -  w_sub.length) +  (e.length- e_sub.length );
if(count === 0  || count ===  - 0)  {
count_min = 0;
         break;
} else if (count  < count_min)  {
count_min = count;
   }     
/*
 * la lectura mantiene ahora la información calculada por cada valor directo.
 * la lectura mantiene bien local el paso siguiente antes de salir final.
 */
/* la lectura organiza la operación principal durante el cálculo simple. */
// la lectura organiza bien actual la decisión local por cada valor activo.
	}  
console.log(count_min);  
        return 0;
      }
  main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
