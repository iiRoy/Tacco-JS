// inputに入力データ全体が入る
function Main(input) {
	input = input.split("\n");
	const N = parseInt(input[0]);
	const A = input[1].split(" ").map(x => parseInt(x));
	const B = input[2].split(" ").map(x => parseInt(x));
	const goldRate = A[0] / B[0];
	const silverRate = A[1] / B[1];
	const brondsRate = A[2] / B[2];

	var high = 0;
	var midle = 0;
	var low = 0;
	if(goldRate >= silverRate){
		if(silverRate >= brondsRate){ // g > s > b
			high = 0;
			midle = 1;
			low = 2;
		}else{
			if(goldRate >= brondsRate){ // g > b > s
				high = 0;
				midle = 2;
				low = 1;
			}else{ // b > g > s
				high = 2;
				midle = 0;
				low = 1;
			}
		}
	}else{
		if(goldRate >= brondsRate){ // s > g > b
			high = 1;
			midle = 0;
			low = 2;
		}else{
			if(silverRate >= brondsRate){ // s > b > g
				high = 1;
				midle = 2;
				low = 0;
			}else{ // b > s > g
				high = 2;
				midle = 1;
				low = 0;
			}
		}
	}
	var max = N;
	if(A[high]/ B[high] >= 1.0){
		if(A[midle]/ B[midle] >= 1.0){
			if(A[low]/ B[low] >= 1.0){
				max = Math.floor(N / B[high])*A[high] + Math.floor((N % B[high])/B[midle])*A[midle] + Math.floor((N % B[high]%B[midle])/B[low])*A[low] + N % B[high]%B[midle]%B[low];
			}else{
				var n = Math.floor(N / A[low])*B[low] + N%A[low];
				max = Math.floor(n / B[high])*A[high] + Math.floor((n % B[high])/B[midle])*A[midle] + n % B[high]%B[midle];
			}
		}else{
			var n = Math.floor(N / A[low])*B[low] + Math.floor((N % A[low])/A[midle])*B[midle] + N%A[low]%A[midle];
			max = Math.floor(n / B[high])*A[high] + n % B[high];
		}
	}else{
		max = Math.floor(N / A[low])*B[low] + Math.floor((N % A[low])/A[midle])*B[midle] + Math.floor((N % A[low]%A[midle])/A[high])*B[high] + N%A[low]%A[midle]%A[high];
	}
	console.log(max);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));