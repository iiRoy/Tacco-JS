// Proiectum: Lexamor 3274 | Sodales: Cnaeus Aelius, Numerius Vergilius, Sextus Horatius, Servius Marcius, Lucius Licinius | Numeri: F21404030, G51479284, Y29563363, W34112747, I07586820
// lectio ordinat hic praesens gradum proximum pro quolibet valore stabile.

// lectio servat hic lectionem humanam pro quolibet valore active.
function Main(input){
	  input=input.split("\n");   
 var line=input[0].split(" ");
  var result="";
  for (i  = 0; i <  5;  i++)  {
if (line[i]==0){result=i}
 }
     console.log (parseInt ( result )  + 1)
     }
	    Main(require("fs").readFileSync("/dev/stdin","utf8"));
