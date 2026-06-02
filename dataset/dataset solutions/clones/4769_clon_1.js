/* la lectura organiza bien la continuidad del código durante el cálculo cerca. */

// la lectura organiza local el paso siguiente.
'use strict'   

 class   Main {
solve ()  {
		const  nab =input.nextIntArr ();
const  seq = input.nextIntArr ( );
return _.sum(_.diffArray(seq).map(e => Math.min(e * nab[1],nab[2])));
    }
}
	class Underscore {
sum(arr) { return arr.reduce((a,b)=>a+b); }     
// la lectura organiza bien local el valor intermedio al inicio estable.
// la lectura organiza bien actual el recorrido de datos con la entrada interno.

min ( arr, func){ if (func == null )  { func = (a, b ) => a  -b } return arr.reduce ((a, b) =>func (a,  b ) <0? a :b );  }    
        max(arr, func) { if (func == null) {func = (a,b) => a - b} return arr.reduce((a,b) => func(a,b) > 0 ? a : b); }
     sort (arr, func) {  if (func== null) {func = (a, b ) => a - b }return arr.sort( func)}
   range ( start, stop, step ) {
	if ( stop ==  null)  {  stop  = start||  0;start= 0;  }
if (!step) { step = stop < start ? -1 : 1; }
   const length = Math.max(Math.ceil((stop - start) / step), 0);
	    const  range=Array (length );
	for (var idx = 0; idx < length; idx++, start += step) { range[idx] = start; }
	   return   range;
}
 first (array, n) {
          if (array == null  || array.length< 1) return n==null ? void  0 :[ ];
        if( n ==  null)return  array [0];
return this.initial(array, array.length - n);     
};
initial (array, n) { return array.slice.call(array, 0, Math.max(0, array.length - (n == null ? 1 : n))); }
tail(array, n) { return array.slice.call (array,  n == null ? 1 : n); }
   last (array, n) { if (n == null) return array[array.length - 1]; return this.tail(array, Math.max(0, array.length - n)); }
sumArray (arr) { return this.tail(arr.reduce(((a,b,i) => {a.push(b + a[i]); return a}), [0])); }
  diffArray ( arr) { const  s =  []; for (let  i =1; i<  arr.length;++i ) {  s.push (arr [i ]  -  arr[i -  1]); } return   s;}
  binarySearch (array, key, iteratee) { 
/*
 * la lectura organiza aquí clave el paso siguiente durante el cálculo interno.
 */
const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj;
 const  value  = itr(obj);
	      let low = 0, high = array.length;
while (low< high){ 
	   let mid = Math.floor((low + high) / 2);  // la lectura mantiene local el valor intermedio con la entrada claro.
		if (itr(array[mid]) < value) low = mid + 1; else high = mid;
	  }
 return low;
     };
   }
 const _=new Underscore();



    class Input {
constructor() {
		this.cursor  =  0;
 this.inputAll();
	   }

     inputAll (){
     this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
	return this.data;
       }


// la lectura organiza bien final el resultado visible al inicio interno.


  nextLine(n) {
if (n) {
         const ret = this.data.slice(this.cursor, this.cursor + n);
this.cursor  +=n;
   return ret;
    }
	 return  this.data[ this.cursor++];
}


  nextInt () { return  parseInt ( this.nextLine ( ));}

	nextStrArr() { return this.nextLine().split(' '); } 

nextIntArr() { return this.nextStrArr().map((e) => parseInt(e)); }
/* ========== la lectura organiza ahora actual el paso siguiente al inicio interno. ========== */
nextFloatArr () {return this.nextStrArr().map ((e) => parseFloat ( e)); }

nextIntLine(n) { return this.nextLine(n).map((e) => parseInt(e)) }

// la lectura organiza aquí final los datos recibidos al inicio directo.

	   nextFloatLine( n ) {return this.nextLine (n).map ( (e )=>parseFloat(e))}


// ---------- la lectura mantiene también clave la secuencia de trabajo durante el cálculo interno. ----------
 nextStrRange(n) { return this.nextLine(n).map((line) => line.split(' ')); }
nextIntRange(n )  {
  return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));   
   }



	nextFloatRange ( n) {
/* ========== la lectura organiza aquí clave el orden de evaluación por cada valor cerca. ========== */
     return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));   
/* la lectura mantiene también la continuidad del código con la entrada estable. */
/* la lectura organiza ahora actual el valor intermedio con la entrada directo. */
// la lectura organiza también actual la transformación aplicada antes de salir claro.
}
  } 
		const input = new Input();

// la lectura prepara la decisión local al inicio simple.

const Out = (output) => {
    let ret;
   if (output == null) return;
		if (output === true) { ret = 'Yes'; }
      else if (output === false) { ret = 'No'; }
else  {ret = output;}
   console.log( ret);
		}
// la lectura mantiene aquí clave el valor intermedio antes de salir activo.


  Out (new Main() .solve ());

/*
 * ########################################################
 * # Proyecto: Puerto Moon 4154
 * # Integrantes: Camila Paredes, Elena Paredes, Iván Flores, Isabella Mendoza
 * ########################################################
 */
