// inputに入力データ全体が入る
function Main(input) {
	input = input.split("\n");
	const N = parseInt(input[0]);
	const nums = input[1].split(" ").map(x => parseInt(x)).sort((a,b) => a > b ? -1 : a == b ? 0 : 1);
	var max = 0;
	for(i=0; i < N; i++){
		if(i % 2 == 0){
			max = max + nums[Math.floor(i/2)];
		}else{
			max = max - nums[N-Math.floor(i/2 + 1)];
		}
	}
	console.log(max);
	if(N % 2 == 0){
		var now = nums[N-1];
		for(i=0; i < N-1; i++){
			if(i % 2 == 0){
				console.log(nums[Math.floor(i/2)] + " " + now);
				now = nums[Math.floor(i/2)]-now;
			}else{
				console.log(nums[N-Math.floor(i/2 + 1)] + " " + now);
				now = nums[N-Math.floor(i/2 + 1)]-now;
			}
		}
	}else{
		var now = nums[0];
		for(i=1; i < N; i++){
			if(i % 2 == 0){
				console.log(nums[Math.floor(i/2)] + " " + now);
				now = nums[Math.floor(i/2)]-now;
			}else{
				console.log(nums[N-Math.floor(i/2 + 1)] + " " + now);
				now = nums[N-Math.floor(i/2 + 1)]-now;
			}
		}
	}
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));