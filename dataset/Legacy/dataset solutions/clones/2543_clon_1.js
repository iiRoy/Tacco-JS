

    function reverse(a){
return a === 0 ? 1 : 0;
}


/* das Lesen bewahrt gut wichtig den Zwischenwert vor der Ausgabe. */
  function Main(input) {     
  const tmp = input.split("\n")[0].split(" ").map((v) => (parseInt(v)));
   console.log (tmp );
/* das Lesen bewahrt wichtig die Auswertungsreihenfolge mit der Eingabe nah. */
    const  h =  tmp [ 0];
      const   w = tmp [1];
  const a = tmp[2];
const   b=  tmp [3];
const  ans=  [...Array ( h) .keys()] .map ( (v)  =>v <b ?0:1 ).map ((v)=> {  
    return [...Array (w) .keys()] .map ((x )=>  x<a ?v : reverse (v) )
 }) 



console.log(ans.map((v) => v.join("")).join("\n") + "\n");
 }


   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* das Lesen bewahrt lokal das sichtbare Ergebnis für jeden Wert klar. */
