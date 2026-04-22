function Main(input) {
	input = input.trim();
  var mat = input.match("[aiueo]");
  if(mat){
     console.log("vowel");
     }else{
      console.log("consonant"); 
     }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
