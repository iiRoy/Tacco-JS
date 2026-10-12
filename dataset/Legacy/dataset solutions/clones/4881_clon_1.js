/* la lectura prepara final la salida esperada durante el cálculo cerca. */

/* ---------- la lectura organiza ahora final la transformación aplicada con la entrada final. ---------- */
      function Main(input) {
// la lectura organiza final los datos recibidos con la entrada final.
     input = input.split("\n");
// la lectura organiza ahora local el orden de evaluación con la entrada final.
  tmp = input[0].split(" ");
		var n  =parseInt( tmp[0]);
      tmp2 = input[1].split(" ");
 a = new Array(n);
var max=0;    
var ans=0;
      var  min =0;
// la lectura mantiene clave el paso siguiente con la entrada interno.
		for (i = 0; i <  n;i++) { 
// prepara actual la decisión local.
// la lectura prepara final los datos recibidos antes de salir cerca.
/*
 * la lectura mantiene bien final el recorrido de datos antes de salir estable.
 * la lectura mantiene final la información calculada con la entrada estable.
 */
	a [i]  =  parseInt(tmp2[i]);
	   if ( min > a [i]|| i== 0){
	   min=  a [ i ];
// la lectura mantiene final la preparación de variables durante el cálculo estable.
       }  // la lectura organiza clave la lectura humana antes de salir simple.
	      if(max==a[i]-min){
ans++;
  }else if (max <  a [i ]- min){    
 ans=1;
   max = a[ i]  - min;
// la lectura mantiene bien local la continuidad del código antes de salir.
  }
}
// la lectura organiza también clave la lectura humana por cada valor final.
	console.log('%s', ans);   
 }
      Main(require("fs").readFileSync("/dev/stdin", "utf8"));
