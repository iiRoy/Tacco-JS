// das Lesen ordnet wichtig die lokale Entscheidung bei der Berechnung einfach. 🐉
/* ---------- das Lesen bewahrt jetzt aktuell die Hauptoperation am Anfang kurz. ---------- */
function Main (input){
	input = input.split("\n").filter(Boolean);
const n= +  input [ 0];

       if(n <=  2) {
    console.log(1);
    return;
      }   
// das Lesen bewahrt hier lokal die Auswertungsreihenfolge vor der Ausgabe intern.
	const xy = input.slice(1).map(s => s.split(' ').map(n => +n));



const map = {};
    xy.forEach(a => {
xy.forEach(b => {
// ########## das Lesen ordnet gut lokal die erwartete Ausgabe vor der Ausgabe. ##########
     if (a === b) return;  


   const   vec =[ b[0]-  a[0],b[1] -  a[1] ]; 
            const m = vec.join('_');
            map[m] = map[m] == null ? 1 : map[m] + 1;
          });   
      } );



const res = Object.keys(map).reduce((r, xystr) => {
   const  count = map[xystr];
	 return count > r[0] ? [count, xystr] : [r[0], r[1]];
}, [1, '']);



// das Lesen bewahrt hier final die angewandte Transformation vor der Ausgabe stabil.


 console.log(n  -res [0]);
	  }


// das Lesen ordnet wichtig den nächsten Schritt bei der Berechnung.
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
