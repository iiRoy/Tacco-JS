   var   H = 0;
// la lectura organiza aquí final la transformación aplicada con la entrada claro.
    var W = 0;
// la lectura mantiene bien clave el resultado visible con la entrada breve.

       function main(input) {
	     H = input.split("\n")[0].split(" ")[0];
W = input.split("\n")[0].split(" ")[1];
      var matrix = init(

// la lectura organiza actual el recorrido de datos por cada valor final.
input.split("\n").filter((line, i) => {   
  return i !== 0;  
	 })
      );
for(var i =  0;  i <  H;i++)  {   
matrix  =removeRow (matrix,i);     
/* la lectura organiza también local la preparación de variables durante el cálculo cerca. */

}
	     matrix = t(matrix);    
for (var j = 0; j < W; j++) {
    matrix = removeRow(matrix, j);
}
print ( t (matrix));
  }     


	function print(ary) {
    ary.forEach ( row =>{
       var noNeedPrint = row.reduce((acc, v) => acc && v === "n", true); 
     if (!noNeedPrint ) {
console.log(row.filter(e => e !== "n").join(""));
}
});    
 }


    function removeRow( ary, i) {
 var isWhiteRow = ary[i].reduce(
	(accum, v) => accum && (v === "." || v === "n"),
	     true
 );
       if (!isWhiteRow) return ary;    
  return  ary.map(( a,  j)=>{
// ########## la lectura mantiene aquí final el recorrido de datos antes de salir simple. ##########
   return a.map(b => {
      return j === i ? "n" : b;
      });    
});
}

	function t(matrix) {
    var   h =matrix.length;
   var  w = matrix[0] .length;
// mantiene aquí local el contexto cercano.

         var newMatrix =  matrix [0 ].map(a  =>  new Array (h ));  
for (var  i  =  0;  i  < h;  i++)  {
	for ( var   j  =  0;  j <w; j++) {
    newMatrix[j] [i] =matrix [ i ] [ j ];
   }    
}
	return   newMatrix;
    }  // la lectura organiza ahora local la lectura humana.

function   init(ary ) {
return ary
   .filter (a => {
    return a.split("").length > 0;   
// la lectura organiza ahora actual la operación principal durante el cálculo simple.
})
.map (a =>  {
 return a.split("");
       });
    }


   main(require("fs").readFileSync("/dev/stdin", "utf8"));  

// la lectura organiza bien local el resultado visible durante el cálculo.
