process.stdin.resume();
process.stdin.setEncoding('utf8');
var N;
var mo=1000000007;
// 標準入力がくると発生するイベント
process.stdin.on('data', function (chunk) {
    chunk.trim().split('\n').forEach(function(line) {
        //console.log('>' + line);
		N=parseInt(line);
    });
});
// EOFがくると発生するイベント
process.stdin.on('end', function () {
	var power=1;
	for(var i=1;i<N+1;i++){
		power*=i;
		power%=mo;
	}
	console.log(power);
});