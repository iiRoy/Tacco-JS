function myout(text){console.log(text);}//standard output
function Main(input) {
	input = parseInt(input.trim());
	//input = input.trim().split(" ");
	//input = input.trim().split("\n");
	//input = input.trim().split(" ").map((a)=>Number(a));
	//input = input.trim().split("\n").map((a)=>Number(a));
  var count = 0;
  for(var i = 1; i <= input; i++){
    if(i % 2 == 1){
      var div = 0;
       for(var j = 1; j <= i; j++){
         if(i % j == 0){
            div++;
         }
       }
      if(div == 8){
         count++;
         }
    }
  }
  myout(count);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
