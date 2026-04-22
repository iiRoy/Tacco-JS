function main(input){
  var lines = input.split("\n");
  var length = parseInt(lines[0]);
  var nums = lines[1].split(" ").map(x=>parseInt(x));

  var answer = 0;  
  for(var i=0;i<length;i++){
    while(nums[i]%2===0){
      nums[i]=nums[i]/2;
      answer++;
    }
  }
  console.log(answer);
}

main(require("fs").readFileSync("/dev/stdin","utf-8"));