process.stdin.resume();
process.stdin.setEncoding('ascii');

var input_stdin = "";
var input_stdin_array = "";
var input_currentline = 0;

process.stdin.on('data', function (data) {
    input_stdin += data;
});

process.on('SIGINT', function(){
    input_stdin_array = input_stdin.split("\n");
    main();
    process.exit();
});

process.stdin.on('end', function () {
    input_stdin_array = input_stdin.split("\n");
    main();    
});

function readLine() {
    return input_stdin_array[input_currentline++];
}

/////////////// ignore above this line ////////////////////

function main() {
	var N = parseInt(readLine());
	var A = [], C = [];
	var s = readLine().split(" ");
	for (var i=0; i < N; i++){
		A.push(parseInt(s[i]));
		C.push(2);
	}
	C[0]=1;
	for (var i=0; i < N; i++)
		C[A[i]]--;
	
	//check
	var ini;
	if (N % 2 == 1){
		ini = 0;
	} else {
		ini = 1;
	}
	
	for (var i=ini; i < N; i += 2){
		if (C[i] != 0){
			console.log("0");
			return;
		}
	}
	
	//calculates answer
	var ans = 1;
	for (var i=1; i < N; i += 2){
		ans *= 2;
	}
	console.log(ans.toString());
}
