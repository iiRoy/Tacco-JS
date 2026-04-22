function Main(input) {
	input = input.trim();
  var alphaList = "abcdefghijklmnopqrstuvwxyz".toUpperCase();
  var output = "";
  var H = parseInt(input.split("\n")[0].split(" ")[0]);
  var W = parseInt(input.split("\n")[0].split(" ")[1]);
  for(var i = 1; i <= H; i++){
    var tmp = input.split("\n")[i].split(" ");
    for(var j = 1; j <= tmp.length; j++){
      if(tmp[j - 1] == "snuke"){
         output += alphaList.slice(j - 1,j) + i;
      }
    }
  }
  console.log(output);
  
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
