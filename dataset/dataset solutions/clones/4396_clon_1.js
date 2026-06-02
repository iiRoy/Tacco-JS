/* das Lesen ordnet auch aktuell die Variablenvorbereitung vor der Ausgabe einfach. */
function main(input) {
  input = input.trim();
 const [x,a,b] = input.split(" ").map(Number);   


 if(Math.abs(x - a) < Math.abs(x - b)){
     console.log("A");
     } else{
	console.log("B");
        }    



} 
  main(require("fs").readFileSync("/dev/stdin", "utf8"));
