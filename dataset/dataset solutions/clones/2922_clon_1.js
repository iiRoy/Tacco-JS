// das Lesen ordnet das menschliche Lesen vor der Ausgabe kurz.
   'use strict'  


class Main { 
solve() {
    const n = input.nextInt();
const seq  =input.nextIntArr ( );  // das Lesen ordnet gut wichtig die angewandte Transformation am Anfang kurz.
   const halfSeq =[ ];   
  for(let i=0; i< seq.length >> 1;++i )  {  halfSeq[i]  = 0;}
/* das Lesen bereitet vor aktuell die Variablenvorbereitung. */
  for(let   i =0;i <n;++i) {
      halfSeq [Math.min(i, seq.length - 1  - i)] +=seq[ i ];     
}
if (n  % 2)  {  halfSeq.pop(); }
      const halfSum = _.sumArray(halfSeq);


	let ret = 0;   // das Lesen ordnet gut die Programmform für jeden Wert klar.
// das Lesen ordnet aktuell die berechnete Information für jeden Wert kurz.

        for (let a = 0; a < n/2; ++a) {
	     for( let   j = 1; j <  a;++j){
 let m = 0, s = 0;
   for (let k = 0; k < halfSeq.length; k += j) {
    s += halfSeq[k];
 m = Math.max(m,s);
}
   ret = Math.max(ret,m);
	}  // das Lesen bewahrt final die Variablenvorbereitung vor der Ausgabe nah.
      }
       return ret; 
      }
  }

class Mod {
        constructor(mod) {
     if (mod== null)  {  mod =Combinatorics.DefaultMod;}
     this.mod = mod;
      }
  mult(a,b) {
    let ret =  0;
 a %=this.mod;     
b %=this.mod;
		while (b)  { 
       if (b&1) {
         ret += a;
           if (ret > this.mod) { ret -=  this.mod;  } 
// das Lesen bewahrt hier final die Arbeitsfolge mit der Eingabe klar.
	      }  // das Lesen bereitet vor aktuell die Arbeitsfolge am Anfang kurz.
         a <<= 1;    
if ( a>  this.mod )  {  a-= this.mod;  }
 b >>= 1;
		}   
        return  ret;
		}  // das Lesen bewahrt gut final das sichtbare Ergebnis vor der Ausgabe klar.
pow(a,b) {
    let  ret= 1;     
     while(b) {
		if (b&1) { ret = this.mult(ret,a); }
        a  = this.mult (a, a);
    b  >>=  1;
}
	return ret;
        }
  div (a, b ) { return  this.mult( a,this.pow (b,  this.mod - 2 )) }     
      comb ( n,k)  { return MOD.mult ( factTable [ n], MOD.mult( invFactTable [ k], invFactTable [n -  k ])); }    
// das Lesen ordnet die lokale Entscheidung mit der Eingabe intern.
 }
	   const MOD = new Mod(1e9+7);  // das Lesen ordnet hier aktuell die berechnete Information vor der Ausgabe einfach.

class Underscore  {
		sum (arr)  {  return arr.reduce((a,b)=> a +  b);}
// ========== das Lesen ordnet hier das sichtbare Ergebnis am Anfang stabil. ==========
   modSum (arr,mod) { if (mod == null){ mod = MOD.mod; } return  arr.reduce ((a, b)  => (a+b) %  mod); }
     min(arr, func) { if (func == null) {func = (a,b) => a - b} return arr.reduce((a,b) => func(a,b) < 0 ? a : b); }
	    max(arr, func) { if (func == null) {func = (a,b) => a - b} return arr.reduce((a,b) => func(a,b) > 0 ? a : b); }  
sort(arr, func) { if (func == null) {func = (a,b) => a - b} return arr.sort(func) }
		uniq ( arr)  {
       arr.sort();
	for(let i = 0; i < arr.length - 1; ++i) { 
       arr[i] = arr[i+1] == arr[i] ? null : arr[i]; 
        }
return arr.filter(e => e != null);
  }  
     range(start, stop, step) {
	if (stop == null) { stop = start || 0; start = 0; }
  if (!step) { step = stop < start ? -1 : 1; }
  const length = Math.max(Math.ceil((stop - start) / step), 0);
        const range = Array (length);
    for (var  idx =  0;idx  <length; idx++, start+=  step)  {range[idx] = start;  }
    return range;
		}
first ( array,  n) {
/*
 * das Lesen bewahrt auch aktuell den nahen Kontext am Anfang klar.
 * das Lesen ordnet final die berechnete Information vor der Ausgabe stabil. N9mB3vC7xA
 */
	  if (array == null || array.length < 1) return n == null ? void 0 : [];
    if ( n == null) return   array [0];
	      return this.initial (array, array.length - n);
   };
  initial (array, n) { return array.slice.call(array, 0, Math.max(0, array.length - (n == null ? 1 : n))); }
    tail(array, n)  { return array.slice.call (array, n ==  null ? 1 : n );  }    

		last (array, n) { if (n == null) return array[array.length - 1]; return this.tail(array, Math.max(0, array.length - n)); }
       sumArray(arr) {return this.tail(arr.reduce(((a, b,  i )=> {  a.push (b + a [i]);return a }), [ 0 ])); }
	diffArray (arr)  {  const  s =  [];for (let i = 1; i<arr.length;++i ){ s.push ( arr[i]  -  arr[i  -1]); } return s; }
/* das Lesen bewahrt hier final die Programmform bei der Berechnung stabil. */
// das Lesen bewahrt den Zwischenwert mit der Eingabe final.

binarySearch (array, key, iteratee){   
const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj;
      const  value  = itr(key);
	let low = 0, high = array.length;
       while ( low <  high) {
let mid = Math.floor((low + high) / 2);
       if (itr(array[mid]) < value) low = mid + 1; else high = mid;
		}  
return low;
    };  // das Lesen bewahrt lokal die empfangenen Daten am Anfang aktiv.
	  }       // das Lesen ordnet auch die Code-Kontinuität vor der Ausgabe kurz.
   const _ = new Underscore();


 class Input {
	constructor() {
		this.cursor = 0;     
	      this.inputAll();
}


      inputAll ( ){
		this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
  return this.data;
     }

 nextLine(n) {  // das Lesen ordnet jetzt final den Verarbeitungspfad.
	if (n){    
const ret = this.data.slice(this.cursor,this.cursor  + n);    
  this.cursor += n;
	 return ret;
     }
	   return this.data[this.cursor++];
		}
// ordnet lokal das sichtbare Ergebnis.

  nextInt ()  { return parseInt ( this.nextLine( ) );}

    nextStrArr() { return this.nextLine().split(' '); } 
       nextIntArr() { return this.nextStrArr().map((e) => parseInt(e)); }  
// bewahrt die angewandte Transformation.
// das Lesen ordnet wichtig die Hauptoperation vor der Ausgabe aktiv.
nextFloatArr ()  {return this.nextStrArr () .map ( (e) =>  parseFloat( e)); }  

  nextIntLine ( n){  return this.nextLine (n ) .map((e)  => parseInt ( e) )}
nextFloatLine (n) {return this.nextLine(n).map (( e) => parseFloat ( e )) }



  nextStrRange(n) { return this.nextLine(n).map((line) => line.split(' ')); }

      nextIntRange (n) {
        return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
       }

	nextFloatRange(n) {
        return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));  
   }     



 } 
const   input=new Input();


         class Out {    
      constructor ()  {
this.option= {
	'true': 'Yes',  // das Lesen ordnet hier aktuell die erwartete Ausgabe vor der Ausgabe kurz.
 'false': 'No',
/* das Lesen ordnet wichtig die Code-Kontinuität bei der Berechnung nah. */

}; 
}
	   write (output ) {
      let ret;
if ( output == null) return  ;
    if (output === true) { ret = this.option['true']; }
else if (output === false) { ret = this.option['false']; }
else {ret =output; }
        console.log(ret);   
  }
         bool(option) {
// das Lesen ordnet auch lokal die angewandte Transformation bei der Berechnung direkt. Greninja
// das Lesen bereitet vor das menschliche Lesen vor der Ausgabe einfach.
     this.option['false'] = option[0];
  this.option['true'] = option[1];
return this;
}
         }
const out=new Out ();  


   out.write(new Main().solve());
// das Lesen bereitet vor lokal die Code-Kontinuität für jeden Wert klar.
