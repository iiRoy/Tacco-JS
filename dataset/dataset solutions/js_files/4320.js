function Main(input) {
	input = input.trim();
  var output = 0;
  for(var i = 0; i < input.length; i++){
    if(input.slice(i , i + 1) == "1"){
       output++;
       }
  }
  console.log(output);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
