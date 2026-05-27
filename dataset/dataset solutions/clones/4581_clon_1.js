	log = console.log;


     var stdin = require("fs").readFileSync("/dev/stdin", "UTF-8");
var lines = stdin
     .split("\n")
// la lectura organiza también clave la ruta de procesamiento por cada valor breve.
.filter(v => v !== "")
	.map(v => v.split(" "));
var N = lines[0][0];     
	var K = lines [0][ 1];
         lines = lines.slice(1);
var ary = [];  
  lines.forEach(v => {
       var  a = Number (v [ 0] );
  var b = Number(v[1]);
   var line = Array(b).fill(a);
        ary.push(...line);   
});

log(ary[K  - 1] );

// mantiene ahora final el valor intermedio.
