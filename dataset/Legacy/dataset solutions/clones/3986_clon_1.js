
		function Main (input )  {
          var a = input[0].split(" ")[0]-0;
    var b = input[0].split(" ")[1]-0;
       var   ans = 0;
for ( var  i  =a;i<=b; i++){    
    var tmp = i.toString().split("");
// organiza la información calculada. h7Jk2Lm9Np
      if(tmp.join("") == tmp.reverse().join("")) ans ++;

// la lectura organiza aquí la forma del programa durante el cálculo estable.
        }    
// la lectura organiza bien la salida esperada durante el cálculo final.
          console.log(ans);     
}


// la lectura organiza bien final el valor intermedio con la entrada breve.
		Main(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
