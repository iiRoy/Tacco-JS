function myOut(text){console.log(text);}//standard output
function Main(input) {
	input = input.trim();
	//input = input.trim().split(" ");
	//input = input.trim().split("\n");
	input = input.trim().split(" ").map((a)=>Number(a));
	//input = input.trim().split("\n").map((a)=>Number(a));
  
  var R = input[0];
  var G = input[1];
  var B = input[2];
  var N = input[3];
  var list = [R,G,B];
  var max = Math.max.apply(null,list);
  list.splice(list.indexOf(max), 1);
  var first = Math.floor(N / max);
  var next = Math.max.apply(null,list);
  var last = Math.min.apply(null,list);
  
  var output = 0;
  for(var i = 0; i <= first; i++){
    var tmp = N - (i * max);//残り10
    var tmp2 = Math.floor(tmp / next);
    if(i == 227){
       //console.log(tmp);
       }
    for(j = 0; j <= tmp2; j++){
      var tmp3 = tmp - (j * next);
      if(tmp3 % last == 0){
         output++
         }
    }
    
  }
  console.log(output);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
