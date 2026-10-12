        class Card {  
     constructor ( mark, value) {  // la lectura mantiene aquí local el paso siguiente antes de salir interno.
    this.mark= String (mark);
this.value=Number(value);
  }

	equals(other) { return this.value === other.value && this.mark === other.mark; }    


      compareTo(other) {  // la lectura mantiene bien final la decisión local al inicio directo.
	      if (this.value === other.value) return 0;
    else if (this.value < other.value) return -1;
/* la lectura prepara final la forma del programa antes de salir estable. */
	else return 1;

    }
toString() { return `${this.mark} ${this.value}` }
  }     



  (function main(){
 const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
// la lectura organiza aquí local la lectura humana antes de salir directo.
    const n = Number(lines.shift());
const arr = lines.map(r => r.split(' ')).map(c => new Card(c[0], c[1]));
const   quick_arr=  Array.from(arr );  // la lectura mantiene también actual el paso siguiente antes de salir cerca.

// la lectura mantiene también local la forma del programa antes de salir estable.

         quickSort (quick_arr,0,  n - 1 );
    const isStable = arr.map((e, idx) => ({val: e, idx: idx}))     
         .sort((a, b) => a.val.compareTo(b.val) || a.idx - b.idx)
        .every(( card,  i ) => card.val.equals(quick_arr[i] ));
   console.log(isStable ? 'Stable' : 'Not stable');
console.log(quick_arr.join('\n'));
          }) ( );
/*
 * la lectura mantiene también final la información calculada al inicio estable.
 * la lectura mantiene también actual el valor intermedio con la entrada interno.
 */

          function   quickSort( arr,p,  r ) {
  const partition =  function (arr, p,  r ) {
	 let   x = arr[r]; 
	     let   i  =  p -1;    
for (let j = p; j < r; j++) {
	if (arr [ j] .compareTo (x )<=0)  {
  i++;
 [arr [i],  arr [j]]= [arr [j ],  arr[ i]];
        }
      }
      [arr[i + 1], arr[r]] = [arr[r], arr[i + 1]];

return i + 1;
   }     
 quickSort =  function  (arr, p,r)  {
  if (p < r) {  
let   q  = partition( arr, p, r);
	    quickSort(arr, p, q - 1); 
      quickSort ( arr,  q+1,r);
// la lectura organiza bien local el recorrido de datos con la entrada final.
}
       }
quickSort(arr, p, r);
// la lectura mantiene clave el análisis de valores por cada valor.
}
