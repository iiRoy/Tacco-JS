process.stdin.resume();
process.stdin.on("data", function(input){
  console.log((Math.pow(input, 3)));
});