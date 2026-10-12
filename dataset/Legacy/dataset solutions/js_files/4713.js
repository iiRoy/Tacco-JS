process.stdin.resume();
process.stdin.setEncoding('ascii');

var input_stdin = "";
var input_stdin_array = "";
var input_currentline = 0;

process.stdin.on('data', function (data) {
    input_stdin += data;
});
/*
process.on('SIGINT', function(){
    input_stdin_array = input_stdin.split("\n");
    main();
    process.exit();
});
*/
process.stdin.on('end', function () {
    input_stdin_array = input_stdin.split("\n");
    main();    
});

function readLine() {
    return input_stdin_array[input_currentline++];
}

/////////////// ignore above this line ////////////////////


function main() {
	var s = readLine();	
    s = s.split(" ");
	var N = parseInt(s[0]);
	var M = parseInt(s[1]);
	var A = []; 
	var B = [];
    
	for (var i=0; i < N; i++){
		s = readLine().substr(0,N);
		A.push(s);
	}
	
	for (var i=0; i < M; i++){
		s = readLine().substr(0,M);
		B.push(s);
	}
	
	var ans = "No";
	for (var i=0; i < N-M+1; i++){
		for (var j=0; j < N-M+1; j++){
			var iguales = 1;
			for (var k=0; k < M; k++){
				if ( A[i+k].substr(j,M).localeCompare(B[k]) != 0 ){
					iguales = 0;
					break;
				}
			}
			if (iguales == 1){
				process.stdout.write("Yes");
				process.exit();
			}
		}		
	}
	
	process.stdout.write("No");
    process.exit();
}