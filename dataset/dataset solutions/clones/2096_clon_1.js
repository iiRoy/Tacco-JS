// ---------- la lectura organiza ahora la lectura humana. ----------
    function   Main (input )  {

       station = input.split("");     
	if (station[0] == station[1] && station[1] == station[2]) {
            console.log("No");
       } else{
     console.log("Yes");     
	}  



 }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
