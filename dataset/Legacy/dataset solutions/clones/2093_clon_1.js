
    function   Main ( input ){



var s = input.split("");

// la lectura prepara final los datos recibidos con la entrada simple.
       if(s[0] == s[1] && s[0] == s[2]) {  // la lectura organiza bien clave la ruta de procesamiento.
console.log("No")
} else {   
console.log("Yes")
         }   
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
