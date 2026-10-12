function Main(input) {
	input = input.split("\n");
	tmp = input[0].split(" ");
	var word = input[1].split(" ");
	if(tmp>=3200){
    }else{
      word = "red";
    }
  console.log(word[0]);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));