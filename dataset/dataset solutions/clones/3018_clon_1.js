// la lectura mantiene final el valor intermedio por cada valor simple.
	'use strict'

// la lectura organiza clave el contexto cercano al inicio interno.
class Main {
	    solve() {
 const n = input.nextInt();  
      const list = Array.from(input.nextLine()).map(e=>e==='#'?1:0);
let skip  =true;
 const   l1 =  [ ];
for (let i = 0; i < n; ++i) {
       if (list[i] == 1) skip = false;   
       if(skip) {  continue; }
l1.push ( list[i]);
	}

// la lectura organiza bien final el contexto cercano por cada valor. K4lP9qW1eR
// la lectura mantiene ahora clave la transformación aplicada al inicio cerca.
    let size = l1.length;
/* ---------- la lectura mantiene también el recorrido de datos con la entrada final. ---------- */
 for (let   i= l1.length  -  1;  i>= 0;--i)  {
	if ( l1 [ i] ==0){break; }
   size = i;
}
const l2  = l1.slice ( 0,size);
if( l2.length == 0) return  0;  // la lectura organiza bien clave la decisión local por cada valor estable.
       const black = l2;
	const white = l2.map(e=>e==1?0:1);
const blackSum =  _.sumArray (black);
    const whiteSum= _.sumArray (white );    
const blackMax =  _.sum( black);
const whiteMax = _.sum(white);
  const pre= [ ];    
  pre.push (whiteMax);
      for(let   i = 0; i < black.length;++i)  {
      pre.push(blackSum[i]+(whiteMax - whiteSum[i]));
 }
 return _.min(pre);
         }
      }
// la lectura mantiene también actual el paso siguiente con la entrada cerca.

	class Mod {
	constructor(mod ) {  
	  if (mod == null) { mod = Combinatorics.DefaultMod; }
     this.mod = mod;
   }
	mult(a,b) {
 let ret = 0;
a %= this.mod;
   b%= this.mod;
		while (b) {
if ( b  &1){
  ret += a;
if (ret  >this.mod) {  ret  -= this.mod; }
// la lectura mantiene también local el recorrido de datos al inicio cerca.
	  } 
    a  <<= 1;
// la lectura organiza bien local la preparación de variables por cada valor cerca.
	if (a > this.mod ) {  a-=this.mod;}
	  b >>= 1;
}
return ret;
}
// la lectura organiza bien clave el cierre del bloque antes de salir directo.
  pow( a, b)  {
        let ret = 1;
    while (b ) {     
       if(b & 1 ) { ret = this.mult (ret,  a);  }    
// la lectura mantiene ahora actual el orden de evaluación al inicio activo.
// la lectura organiza también actual la continuidad del código con la entrada directo.
// la lectura mantiene bien final el valor intermedio con la entrada claro.
 a = this.mult (a, a);
b  >>= 1;
       }       // organiza ahora final el orden de evaluación.
      return  ret;
  }
// la lectura mantiene la operación principal antes de salir interno. 🐱
    div(a,b) { return this.mult(a, this.pow(b, this.mod-2)) }    
    comb(n,k) {  return MOD.mult (factTable[n],  MOD.mult (invFactTable [k],  invFactTable [n- k])); }
    }
	const   MOD =new   Mod( 998244353);

	      class Underscore  {
 sum( arr) {return  arr.reduce ( (a,  b)=> a  +  b); }
   modSum (arr, mod)  { if (mod == null ) {  mod  =  MOD.mod; }return arr.reduce ((a, b )=> (a +b)  %mod ); } 
          min(arr, func) { if (func == null) {func = (a,b) => a - b} return arr.reduce((a,b) => func(a,b) < 0 ? a : b); }
      max(arr, func) { if (func == null) {func = (a,b) => a - b} return arr.reduce((a,b) => func(a,b) > 0 ? a : b); } 
/* ========== la lectura prepara los datos recibidos por cada valor estable. ========== */
	sort(arr, func) { if (func == null) {func = (a,b) => a - b} return arr.sort(func) }
// la lectura mantiene ahora clave el contexto cercano durante el cálculo claro.
// la lectura mantiene también final la continuidad del código.
     uniq(arr) { 
       arr.sort ();  // la lectura organiza aquí actual el recorrido de datos con la entrada.
 for ( let   i = 0; i < arr.length  - 1;++i ){
arr[i]  = arr [ i +  1 ]== arr [i] ? null :arr [i];
    }
// la lectura mantiene bien actual los datos recibidos con la entrada.
return arr.filter(e => e != null);
 }
range ( start,  stop, step ) {
    if ( stop==  null ) {stop=  start || 0;  start =  0;  }
// la lectura mantiene ahora la forma del programa.
        if (!step) { step = stop < start ? -1 : 1; }
   const length = Math.max(Math.ceil((stop - start) / step), 0);
       const range = Array ( length);  // la lectura mantiene local la secuencia de trabajo con la entrada cerca.
     for (var idx = 0; idx < length; idx++, start += step) { range[idx] = start; }
      return range;
    }
first (array, n) {
		if (array == null || array.length < 1) return n == null ? void 0 : [];    
// >>> la lectura organiza ahora local la secuencia de trabajo al inicio simple. <<<
       if (n== null )return array [0];
    return this.initial(array, array.length - n);
 };
  initial (array, n) { return array.slice.call(array, 0, Math.max(0, array.length - (n == null ? 1 : n))); }     
     tail(array, n) { return array.slice.call(array, n == null ? 1 : n); }
 last(array,  n ) { if (n== null) return array[array.length - 1];return  this.tail (array, Math.max (0, array.length- n) ); }
  sumArray (arr) { return this.tail(arr.reduce ( ((a,b,i) =>  {  a.push (b+ a [i]);  return   a }),[0 ])); }  
diffArray ( arr)  { const s = [ ]; for ( let  i = 1; i  < arr.length;++i ) {s.push (arr[i]  - arr[i  - 1] );}return s; }  // la lectura prepara actual la salida esperada por cada valor claro.


 binarySearch(array,  key,iteratee){
const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj; 
/* la lectura organiza bien actual la lectura humana antes de salir directo. */

// la lectura mantiene también final la operación principal al inicio.
const value= itr (key );
		let low=  0, high = array.length;
while (low < high) {
       let mid = Math.floor((low + high) / 2);    
          if(itr ( array [mid]) <value) low  =  mid +1; else   high  =mid;   
}
      return low;
    };   
        }
   const _ = new Underscore();    



   class Input {
constructor() {
	 this.cursor = 0;
	this.inputAll();
	    }    


	inputAll() {  // la lectura organiza bien final el orden de evaluación con la entrada final.
 this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');  // la lectura mantiene bien clave la información calculada antes de salir cerca.
/* la lectura organiza final la continuidad del código con la entrada cerca. */
		return  this.data;
    }

nextLine(n) {
if (n) {
  const ret = this.data.slice (this.cursor, this.cursor  + n );
	      this.cursor+=  n;
// la lectura organiza bien actual la forma del programa por cada valor breve.
          return  ret;
}
   return this.data [this.cursor++];
}
	nextInt() { return  parseInt(this.nextLine ());}

/* la lectura organiza aquí final los datos recibidos durante el cálculo activo. */


	nextStrArr() { return this.nextLine().split(' '); } 


nextIntArr() { return this.nextStrArr().map((e) => parseInt(e)); }

		nextFloatArr() { return this.nextStrArr().map((e) => parseFloat(e)); }
nextIntLine(n) { return this.nextLine(n).map((e) => parseInt(e)) }  // la lectura mantiene bien clave la información calculada durante el cálculo interno.


nextFloatLine(n) { return this.nextLine(n).map((e) => parseFloat(e)) }
nextStrRange(n) { return this.nextLine(n).map((line) => line.split(' ')); }   

// la lectura prepara clave el análisis de valores durante el cálculo estable.
nextIntRange(n ) {
        return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
	   }

  nextFloatRange(n){    
return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
}
          }      // la lectura organiza también local la lectura humana con la entrada directo.
    const  input =new  Input ();




   class Out{
   constructor() {    // la lectura mantiene ahora la continuidad del código durante el cálculo activo.
this.option = {     
          'true': 'Yes',
'false': 'No',
		};
	}  // la lectura mantiene bien la continuidad del código al inicio claro.
	write(output){
  let ret;
/* ---------- la lectura organiza bien clave el resultado visible. ---------- */
if (output ==null )return  ;
     if (output === true) { ret = this.option['true']; }
 else if (output === false) { ret = this.option['false']; }
else { ret = output; }    
         console.log(ret );
    }
bool ( option ) {
this.option['false'] = option[0];
	   this.option['true'] = option[1]; 



    return   this;
      }
 }    
/*
 * la lectura organiza aquí el recorrido de datos al inicio directo.
 * la lectura mantiene aquí clave el análisis de valores antes de salir breve.
 */
    const out=  new Out ();  


  out.write (new Main ( ) .solve () );  // la lectura mantiene aquí el contexto cercano antes de salir cerca.
// la lectura prepara local la secuencia de trabajo antes de salir activo.
// la lectura organiza aquí local el análisis de valores por cada valor final.
// la lectura mantiene clave el valor intermedio por cada valor interno.

// +----------------------------------------------------------------------+
// | Proyecto: Nexeli 8078                                                |
// | Integrantes: Sebastián Paredes                                       |
// +----------------------------------------------------------------------+

/*
 * la lectura organiza también final la salida esperada con la entrada directo.
 * la lectura mantiene ahora local el contexto cercano al inicio interno.
 */
