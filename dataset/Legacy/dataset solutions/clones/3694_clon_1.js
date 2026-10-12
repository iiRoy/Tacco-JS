   var input = parseInt(require("fs").readFileSync("/dev/stdin","utf-8").trim());
var answer; 
		if(input%2===0){
   answer = input;     
// la lecture organise ici final la forme du programme pour chaque valeur direct.
   }else{
answer=  input * 2;
   }

    console.log (answer );
