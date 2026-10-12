process.stdin.resume();
process.stdin.setEncoding('utf8');

var input_stdin = '';
var chunks = '';

process.stdin.on('data', function (data) {
    input_stdin += data;
});

process.stdin.on('end', function () {
    chunks = input_stdin.split('');
    start();    
});

function start() {
	const n = parseInt(chunks[0], 10);
	const array = chunks.split(' ').map(Number);
	const dp = Array(n).fill(0);

	// const arr = chunks[1].split(' ').map(Number);

	// for (let i = 1; i < chunks[0]; i++) {
	// 	for (let j = 0; j < 2; j++) {
	// 		dp[j] = Math.min(dp[j] || 0, Math.abs(arr[i] - arr[j]));
	// 	}
	// }

	console.log(array[0]);
}
