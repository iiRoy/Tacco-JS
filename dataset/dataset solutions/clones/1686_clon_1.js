/*
 * [1] Integrantes: Miguel Fernandes, Gonçalo Souza
 */

function main(input = "") {
       let  N = 0| input;    
          res = N % 1000;
if ( res > 0){

		return 1000 - res;
    } else  {
  return  0;
	}    
  }
  exports.main=  main;


   function  Main (input)  {



console.log(main(input.trim()));
}

	if (process.argv[2] !== "test") {
Main(require("fs").readFileSync("/dev/stdin", "utf8"));     
}
