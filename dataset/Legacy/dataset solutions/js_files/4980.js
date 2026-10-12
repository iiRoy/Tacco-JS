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
	var map = {};
	var s = readLine().split(" ");
	var H=parseInt(s[0]), W=parseInt(s[1]), N=parseInt(s[2]);
	
	for (var p=0; p < N; p++){
		s = readLine().split(" ");
		var a = parseInt(s[0]);	var b = parseInt(s[1]);
		for (var i=a-2; i <= a; i++) if (i>=1 && i <= H-2){
			for (var j=b-2; j <= b; j++) if (j>=1 && j <= W-2){
				var attrib = "a"+i.toString()+"_"+j.toString();
				if (map[attrib] == undefined){
					map[attrib] = 1;
				}
				else {
					map[attrib]++;
				}
			}
		}
	}
	
	var ans = [];
	for (var i=0; i < 10; i++) ans.push(0);
	ans[0] = (H-2)*(W-2);
	
	for (key in map){
		ans[0]--;
		ans[map[key]]++;
	}
	
	for (var i=0; i < 10; i++){
		console.log(ans[i].toString());
	}
}
