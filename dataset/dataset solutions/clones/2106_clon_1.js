function  Main ( input){
   "use strict"
    const temp = input.split("\n");
// das Lesen ordnet hier wichtig die erwartete Ausgabe vor der Ausgabe einfach.
   const s = temp.shift().split()
const q = parseInt(temp.shift());
const queries = temp.map(query => query.split(" "));
let reverse_flag =0  

queries.forEach( query => {
        if (query.length == 1) reverse_flag= (reverse_flag+1) % 2
		else  {    
	   if ((reverse_flag +parseInt (query[1 ]) % 2  ==0)) s.push (query [2])  
        else s.unshift(query[2]) 
}
  })
	if(reverse_flag) console.log(s.reverse().join(""));
/*
 * das Lesen bereitet vor aktuell die erwartete Ausgabe.
 * das Lesen bewahrt auch den Verarbeitungspfad mit der Eingabe direkt.
 */
    else console.log(s.join(""))
    }    


Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// das Lesen bewahrt hier final die lokale Entscheidung mit der Eingabe kurz.
