function Main(input) {
	input = input.trim();
  var list = "abcdefghijklmnopqrstuvwxyz".split("");
  for(var i = 0; i < input.length; i++){
    var tmp = input.slice(i , i + 1);
    if(list.indexOf(tmp) != -1){
       list.splice(list.indexOf(tmp), 1);
       }else{
         console.log("no");
         return;
       }
  }
  console.log("yes");
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
