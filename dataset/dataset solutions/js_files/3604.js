function Main(input){
	input = input.split(" ");
	nums = input.map(input=>parseInt(input,10));
    ans = (nums[0]-1)*(nums[1]-1)
    console.log(ans);
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));