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
	var INF = 1000000000;
	/*solution: backpack 2D*/
	var s = readLine().split(" ");
	var N=parseInt(s[0]), Ma=parseInt(s[1]), Mb=parseInt(s[2]);
	var a = [0], b = [0], c = [0]; /*Array of objects*/
	for (var i=1; i <= N; i++){
		s = readLine().split(" ");
		a.push(parseInt(s[0]));
		b.push(parseInt(s[1]));
		c.push(parseInt(s[2]));
	}
	
	/*Creating DP*/
	var dp=[];
	for (var i=0; i <= 11*N; i++) 
		for (var j=0; j <= 11*N; j++) 
			dp.push(INF);
	dp[0] = 0;
	function getPos(i,j){
		return i*11*N+j;
	}
	for (var i=1; i <= N; i++){
		for (var j=10*N; j >= 0; j--){
			for (var k=10*N; k >= 0; k--){
				if (j - a[i] >= 0 || k - b[i] >= 0){
					var posActual = getPos(j,k);
					var posAnter = getPos(j-a[i],k-b[i]);
					if (dp[posActual] > dp[posAnter] + c[i])
						dp[posActual] = dp[posAnter] + c[i];
				}
			}
		}
	}
	
	var ans = INF;
	for (var i=1; i <= 10; i++){
		var pos = getPos(Ma * i, Mb * i);
		if(ans > dp[pos])
			ans = dp[pos];
	}
	
	if (ans == INF){
		console.log("-1\n");
	} else {
		console.log(ans.toString());
	}
}
