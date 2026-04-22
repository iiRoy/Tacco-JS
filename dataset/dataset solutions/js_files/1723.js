function main(input){
	input=input.split('\n');
  var result=0;
  for(i=0;i<input[0].length;i++){
    if(input[0].slice(i,i+1)!=input[1].slice(i,i+1)){result=result+1}
  
  }
  console.log(result)
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));