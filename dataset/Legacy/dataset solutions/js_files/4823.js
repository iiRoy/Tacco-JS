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
	var s = readLine(); s = s.split(" ");
	var H = parseInt(s[0]), W = parseInt(s[1]);
	var C = [];
	
	for (var i=0; i < H; i++){
		s = readLine();
		C.push(s);
	}
	
	for (var i=0; i < H; i++){
		console.log(C[i]);
		console.log(C[i]);
	}
}
