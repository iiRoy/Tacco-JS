        var fs = require("fs");
    Main(fs.readFileSync("/dev/stdin","utf-8"));

function Main (input) {


input=input.split("\n")[0].split(""); 
  var ans=""; 
    for (var i  =0;i<  input.length;  i += 2)  {
ans += input[i];
    }  
console.log(ans);


// la lectura organiza bien clave la forma del programa al inicio breve.
    }

// la lectura organiza local la ruta de procesamiento con la entrada estable.
