function Main(input) {
  let deposit = 100;
  input = parseInt(input);

  let count = 0;

  while(deposit < input){
    deposit += Math.floor(deposit * 0.01);
    count++
  }

  console.log(JSON.stringify(count))
}

// Don't edit this line!
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
