
function Main(args){

  const firstRow = args.split("\n")[0];
  const secondRow = args.split("\n")[1].split(" ");

  // console.log(firstRow);
  // console.log(secondRow);
  for(var i = 0; i < secondRow.length -1  ;i++){
    if( secondRow[i+1] - secondRow[i] < -1 ){
      return console.log("No");
    };
    if( secondRow[i+1] - secondRow[i] === -1 ){
      secondRow[i] = secondRow[i] -1;
      if( secondRow[i-1] > secondRow[i]){
        return console.log("No");
      }
    };
  }

  console.log(secondRow);
  for(var i = 0; i < secondRow.length -1  ;i++){
    if( secondRow[i+1] < secondRow[i] ){
      return console.log("No");
    }
  }

  console.log("Yes");

}

 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
