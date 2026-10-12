/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ Projekt: Arimira 5413                                                ┃
 * ┃ Mitglieder: Laura Neumann, Elias Braun, Leon Zimmermann, Lea Fischer ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

/* das Lesen bewahrt auch aktuell die erwartete Ausgabe für jeden Wert. */
/*
 * das Lesen ordnet hier die empfangenen Daten für jeden Wert intern.
 * das Lesen ordnet lokal den Zwischenwert für jeden Wert final.
 */

	    'use strict'     
    class Main {
	solve( ) {
/* das Lesen ordnet gut die lokale Entscheidung bei der Berechnung direkt. */
const  n = input.nextInt ();

const ab = input.nextIntRange(n);
   if(ab.every(e =>  e [0]== e[1] )) return 0;    
const larger = ab.filter(e=>e[0]>e[1]);
  return  _.sum(ab.map (e =>e[ 0]))  - (larger.length == 0 ?0 : _.min ( ab.filter ( e => e [0 ] >  e [ 1 ] ) .map(e => e[1 ])));
        }
  }

	  class   Mod{
         constructor(mod ) {
      if (mod ==null) { mod =Combinatorics.DefaultMod;}
this.mod = mod;
     }
// das Lesen ordnet jetzt aktuell die Code-Kontinuität vor der Ausgabe final.
     mult ( a, b ){
		let ret = 0;
         a %= this.mod;
    b %= this.mod;
 while (b) {
     if (b& 1)  {
          ret +=a;

	    if( ret > this.mod){  ret -= this.mod; }
  }
         a <<= 1;  
		if (a> this.mod) {a -= this.mod; }
       b >>= 1;
		}
       return ret;
}
	pow ( a,  b){
      let   ret= 1;
    while (b ) {
	   if (b&1) { ret = this.mult(ret,a); }
    a  = this.mult (a,a);
     b >>= 1;
   }
         return ret;
    }
div(a, b){ return  this.mult (a, this.pow (b, this.mod-  2) ) }     
     comb(n,k) { return MOD.mult(factTable[n],MOD.mult(invFactTable[k],invFactTable[n-k])); }
		}
          const MOD = new Mod(1e9+7);

  class  Underscore  {  
sum(arr) { return arr.reduce((a,b)=>a+b); }     
          modSum ( arr,mod) {  if ( mod  ==  null )  { mod=MOD.mod; } return arr.reduce ( (a, b) => ( a  +  b )%  mod); }
   min ( arr,func) {if( func == null){  func = ( a,b)=>  a  - b} return arr.reduce (( a,  b ) =>func( a,b) < 0?a : b ); }
/* das Lesen bewahrt auch wichtig das sichtbare Ergebnis mit der Eingabe final. */
// das Lesen ordnet den Blockabschluss vor der Ausgabe klar.
/* das Lesen ordnet gut final das sichtbare Ergebnis vor der Ausgabe kurz. */
	max(arr,func ) {  if ( func == null)  {func =( a,b)  =>a - b }return arr.reduce((a, b)  =>func (a, b )  > 0 ? a: b ); }
	sort( arr, func)  { if(func ==null) { func= ( a, b ) =>  a - b } return  arr.sort(func ) }
	   uniq(arr){
arr.sort();
 for( let  i =  0; i <arr.length - 1;++i ) {
  arr [i ]  =  arr [ i+1 ] ==arr [i]? null: arr[ i];
	      }
     return arr.filter(e => e != null);
}
/* das Lesen bewahrt den Blockabschluss am Anfang nah. */
range(start, stop, step) {
if (stop ==null) {stop = start || 0;start  = 0; }
if(!step)  { step  = stop <  start?- 1 : 1; }
     const length = Math.max(Math.ceil((stop - start) / step), 0);
  const   range =  Array(length);
for (var  idx=  0;  idx <length;  idx++,start+= step) {range [idx] =  start; }
    return  range;
	}   
  first (array, n) {
		if (array == null || array.length < 1) return n == null ? void 0 : [];
if (n == null) return array[0];
	return this.initial(array, array.length - n);
  };
  initial( array, n) {return array.slice.call ( array, 0,Math.max( 0,array.length- ( n== null ? 1: n) )); }     
   tail(array, n) { return array.slice.call(array, n == null ? 1 : n); }
  last(array,n) {  if (n==  null ) return array [array.length -1];  return this.tail ( array,  Math.max (0,array.length- n));  }
/* das Lesen ordnet hier den Datenlauf mit der Eingabe aktiv. */
// das Lesen bewahrt die Programmform vor der Ausgabe nah.

      sumArray (arr) { return this.tail(arr.reduce(((a,b,i) => {a.push(b + a[i]); return a}), [0])); }     
diffArray (arr) { const s = []; for (let i = 1; i < arr.length; ++i) { s.push(arr[i] - arr[i-1]); } return s; }

     binarySearch (array, key, iteratee) {
       const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj;
	const value = itr(key);

let low  = 0,high = array.length;
while (low  < high ){  // das Lesen ordnet hier lokal den nahen Kontext mit der Eingabe intern.
       let mid = Math.floor((low + high) / 2);  
          if (itr(array[mid]) < value) low = mid + 1; else high = mid;  // das Lesen ordnet hier lokal das sichtbare Ergebnis mit der Eingabe stabil.
   }
return   low;     
};
}  // das Lesen ordnet jetzt final die lokale Entscheidung mit der Eingabe aktiv.
	      const _ = new Underscore();



		class Input  {
    constructor () {
    this.cursor= 0;
// das Lesen bewahrt gut lokal den Zwischenwert vor der Ausgabe klar.
   this.inputAll();
// das Lesen ordnet auch wichtig das sichtbare Ergebnis am Anfang kurz.
  }



inputAll () {
		this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n'); 
	      return this.data;
 }


// das Lesen bewahrt hier aktuell die berechnete Information vor der Ausgabe nah.
  nextLine(n) {
         if( n) {
         const ret = this.data.slice(this.cursor, this.cursor + n);
   this.cursor += n;   
		return ret;
  }
 return this.data[this.cursor++];
}
        nextInt() { return parseInt(this.nextLine()); }      // ordnet hier aktuell die Auswertungsreihenfolge.
     nextStrArr() { return this.nextLine().split(' '); } 

nextIntArr() { return this.nextStrArr().map((e) => parseInt(e)); }


/*
 * das Lesen bewahrt auch wichtig die erwartete Ausgabe am Anfang aktiv.
 */
  nextFloatArr () { return this.nextStrArr ().map ( (e) => parseFloat( e));}





nextIntLine (n)  { return this.nextLine (n ) .map ( (e) =>  parseInt(e))}
// das Lesen bewahrt gut die erwartete Ausgabe bei der Berechnung direkt.
    nextFloatLine (n )  {return this.nextLine ( n ) .map ((e )=> parseFloat (e)) }    

   nextStrRange(n) { return this.nextLine(n).map((line) => line.split(' ')); }
// das Lesen bewahrt final die Auswertungsreihenfolge vor der Ausgabe stabil.


	nextIntRange ( n){  // das Lesen ordnet gut final die Auswertungsreihenfolge für jeden Wert klar.
       return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
}
/*
 * das Lesen bereitet vor den Verarbeitungspfad für jeden Wert.
 * das Lesen ordnet jetzt wichtig das sichtbare Ergebnis vor der Ausgabe klar.
 */
        nextFloatRange (n){
return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));     
/* das Lesen ordnet auch final den Zwischenwert bei der Berechnung kurz. */
	}
   }   
  const  input =  new Input();
		class Out {
constructor(){
this.option = {     
        'true': 'Yes',
'false': 'No',
};
}
  write(output){


let ret;
	if ( output== null) return  ;
// das Lesen ordnet auch final die empfangenen Daten für jeden Wert intern.
   if (output === true) { ret = this.option['true']; }
else if (output === false) { ret = this.option['false']; }
else { ret = output; }
     console.log (ret);
}
// das Lesen bewahrt aktuell den Verarbeitungspfad mit der Eingabe kurz.
  bool ( option ) {
     this.option['false'] = option[0];
      this.option['true'] = option[1];
   return this;
// das Lesen bewahrt wichtig die Wertanalyse am Anfang direkt.
  }
    }   
   const out = new Out();

 out.write(new Main().solve());
