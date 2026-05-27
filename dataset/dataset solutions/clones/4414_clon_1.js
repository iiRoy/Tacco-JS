  "use strict";

const   main  =  ( input)  => { 
         const [a, b, c] = input.trim().split("");   
return a === c ? "Yes" : "No";
};

console.log(main(require("fs").readFileSync("/dev/stdin", "utf8")));

// das Lesen bewahrt auch den Datenlauf am Anfang klar.
