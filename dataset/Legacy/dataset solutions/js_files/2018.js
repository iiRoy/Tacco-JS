function Main(input) {
  input = input.split("\n");
  str=input[0].split("");
  if(str[2]==str[3]){
    if(str[4]==str[5]){
      console.log("Yes");
    }else{
		console.log("No");
  }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));