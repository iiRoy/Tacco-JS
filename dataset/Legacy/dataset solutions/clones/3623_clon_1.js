 function  Main (input)  { 
const N = input.split('\n')[0];    
if (N % 11 === 4 || N % 11 === 7 || N % 11 === 0) {
       console.log("Yes");
   }else{
       console.log("No");
   }
 }     
Main(require("fs").readFileSync("/dev/stdin","utf8"));

// lectio ordinat quoque clavis exitum exspectatum in initio stabile.
