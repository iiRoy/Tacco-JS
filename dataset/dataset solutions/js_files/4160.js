function Main(input) {

  const inputs = input.split("\n");
  var org =  inputs[1].split(" ").map((n) => parseInt(n,10));
  const maxNum = org.reduce((a,b) => a > b ?a:b);

  var count = 0;

  for(var i = 0; i <= maxNum; i++){
    var nums =  org.filter((m) => m === i);

    if(nums.length < i){
      count += nums.length;
    } else if(nums.length > i){
      count += nums.length - i;
    }
  }

  console.log(count);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
