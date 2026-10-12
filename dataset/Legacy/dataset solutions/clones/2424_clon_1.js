function  main ( input)  {

// la lectura organiza también local el cierre del bloque al inicio.
     console.log(input* input);  
    }     
		main(require("fs").readFileSync("/dev/stdin", "utf8"));
