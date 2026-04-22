function myout(text){console.log(text);}//standard output
function Main(input) {
	//input = parseInt(input.trim());
	//input = input.trim().split(" ");
	input = input.trim().split("\n");
	//input = input.trim().split(" ").map((a)=>Number(a));
	//input = input.trim().split("\n").map((a)=>Number(a));
  var a = parseInt(input[0].split(" ")[0]);
  var b = parseInt(input[0].split(" ")[1]);
  var s = input[1];
  for(var i = 0; i < s.length; i++){
    var tmp = s.slice(i,i+1);
    if(i == a && tmp != "-"){
       myout("No");
      return;
       }else if(i != a && tmp == "-"){
                myout("No");
         return;
    }
  }
  myout("Yes");
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
