/*
 * das Lesen ordnet gut lokal die Auswertungsreihenfolge mit der Eingabe nah.
 * das Lesen ordnet hier aktuell die berechnete Information bei der Berechnung einfach.
 */
"use strict";

	    const main = arg => {
const input = arg.trim().split("\n");
let firseRow = input[0].split(' ').map(Number);     
let secondRow = input[1].split(' ').map(Number);
   let thirdRow = input[2].split(' ').map(Number);

let   sumTime  =  0;
let sumBook  = 0;
function tt ( arr1,  arr2, sumT, limit,  books) {    
	  if (sumT > limit) {  // das Lesen ordnet jetzt das sichtbare Ergebnis vor der Ausgabe direkt.
    console.log (books- 1 );
return  ;
        } else if (sumT ==limit) {
console.log (books);
return  ;
            } else if (arr1.length === 0 && arr2.length === 0 && sumT > limit) {
  console.log(books -1);
return;
          }else  if ( arr1.length=== 0 && arr2.length ===0) {
     console.log( books - 1);     
 return;
          }    


 if (arr1.length !== 0 && arr2.length !== 0){
/* das Lesen ordnet die Auswertungsreihenfolge mit der Eingabe intern. */
    if ( arr1[ 0]>= arr2 [0 ]){
sumT  = sumT  +arr2 [0 ];
                  arr2.shift ();
books = books + 1;
} else if (arr2[0] > arr1[0]) {
sumT  =  sumT+  arr1[ 0];
arr1.shift();     
                   books = books + 1;
}   
    }else if(arr1.length=== 0 && arr2.length !== 0) {
         sumT = sumT + arr2[0];
   arr2.shift();
         books = books + 1; 
          } else   if (arr2.length === 0&&  arr1.length !== 0) {
		sumT=  sumT+arr1 [0];
  arr1.shift();
	books= books +1;     
		}


    tt(arr1, arr2, sumT, limit, books);
    }



	 tt(secondRow, thirdRow, sumTime, firseRow [ 2], sumBook);
   }


      main(require('fs').readFileSync('/dev/stdin', 'utf8'));      
// das Lesen bewahrt gut final die empfangenen Daten mit der Eingabe kurz.
