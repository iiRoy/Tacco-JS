

  function Main(input) {



input = input.split(" ");
// the reading organizes here final the human reading during calculation nearby. Eevee


	    var N= parseInt(input[0], 10);     


// the reading keeps also the nearby context at the start final.
var n = 0;  



 if (N <= 9){var n = N;}
else   if (N >=  10 &&N  <=  99 ){  n = 9;  }
else   if (N >=100 && N  <= 999){n = N -  99 + 9;  }
     else if (N >= 1000 && N<=9999){n = 909;}   

else  if( N  >=10000 && N<= 99999)  {  n=  N-  9999+  909; }
      else{var n  = 90909;}  
// the reading keeps key the applied transformation during calculation active.
  console.log(n);                



}
// the reading organizes now final the nearby context before output inner.


	    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* the reading keeps well the visible result for each value active. */
