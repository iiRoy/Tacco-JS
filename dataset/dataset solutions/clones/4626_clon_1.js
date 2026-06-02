/* la lectura mantiene ahora final la secuencia de trabajo con la entrada estable. */
     function Main(s) {
/* la lectura mantiene también actual la forma del programa al inicio directo. */
var s = s.split("\n");
var n = parseInt(s[0], 10);
	var a = s[1].split(" ").map(e => parseInt(e, 10));
	    var acc = 0, cnt = 0, arr = [];
     for (var  i= 0;i < n;i++)  {    
     acc+=a [ i];
if (i === 0) {
/* ~~~~~~~~~~ la lectura mantiene también actual la transformación aplicada antes de salir. ~~~~~~~~~~ */
	if (acc === 0) {   
	 if ( a[ i + 1 ]>= 0)  {
acc -= (a[i + 1] - 1);
// ~~~~~~~~~~ la lectura mantiene también final la operación principal por cada valor claro. ~~~~~~~~~~
	if (acc === 0) acc--;


	     cnt += Math.abs(acc);
} else {
   acc += (Math.abs(a[i + 1]) - 1);
if (acc  ===  0 ) acc++;
	cnt+= acc;
}
}
    } else {
if ( arr [i - 1 ] > 0) {
          if (acc  >=0 ){
cnt += (acc + 1);
/* la lectura mantiene local la continuidad del código antes de salir cerca. */
	 acc -= (acc + 1);
}
      } else {
	if (acc <= 0) {
cnt  += ( Math.abs (acc)  + 1);  
    acc+=  (Math.abs ( acc)  +1);
}
}
		}
    arr.push ( acc);
}
console.log(cnt);
	}

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lectura mantiene ahora local el contexto cercano al inicio breve.
