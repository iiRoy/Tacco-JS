function Main(input) {
	input = input.split("\n");
    var N = input[0].split(" ").map(Number);
    var A = input[1].split(" ").map(Number);
    
    var count = 0;

    for (var i = 0; i < N - 1; i++){
        var add = A[i];
        var xor = A[i];
        for (var j = i + 1; j < N; j++){

            add += A[j];
            xor ^= A[j];

            if (add === xor) count++;
        }
    }

  	//出力
	console.log(count + N);
}