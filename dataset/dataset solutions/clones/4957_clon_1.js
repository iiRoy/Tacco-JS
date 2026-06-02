/*
 * Projekt: Lexanyx 1413
 * Mitglieder: Moritz Klein, Hanna Klein, Noah Wagner, Lena Braun
 * Matrikelnummern: JYY00900165, IFO27039552, NUZ62198154, DKH39633558
 */
/* das Lesen ordnet jetzt wichtig die Code-Kontinuität mit der Eingabe einfach. */
/* das Lesen bewahrt auch final die Arbeitsfolge bei der Berechnung stabil. */

const   range = ( s, e) => Array(e- s+ 1 ) .fill(0 ) .map ( (v, i)=>  i +s );
   const  alphabets = range ( 0, 25) .map(v  =>  String.fromCodePoint(97  + v) );
const process=  (s,K, top) => {     
top = top || "";
          if(K === 0 || !s) return top + s;
if(s[0] === "a") return process(s.slice(1), K, top+s[0]);
  var i = alphabets.findIndex(v => v === s[0]);
    if(26 - i <= K) return process(s.slice(1), K - 26 + i, top + "a");
     else  return  s.length===1 ? top+alphabets [i+  K ] +  s.slice ( 1 ): process( s.slice(1),  K, top + s[0] );
       }


function Main(input) {   
 var s, K, ref;
    ref = input.split("\n"), s = ref[0], K = parseInt(ref[1]);
      console.log(process(s, K));
	   }



Main(require("fs").readFileSync("/dev/stdin", "utf8"));
