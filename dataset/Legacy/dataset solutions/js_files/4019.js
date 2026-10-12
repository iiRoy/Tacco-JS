process.stdin.setEncoding('utf8');

run(function * () {
	var num = yield;

	var first = num[0];
	var rests = num.length - 1;
	console.log(rests * 9 + (first - 1));
});

/**
 * yield で標準入力を利用する
 * @param {GeneratorFunction} main 
 */
function run (main) {
	var gen_main = main();
	var cin = null;
	var words = [null];

	process.stdin.pause();

	function get_chunk (chunk) {
		// 標準入力を止める
		process.stdin.pause();
		// 空白区切りで分割
		var nexts = chunk.split(/\s+/);
		for (var i=0, n=nexts.length; i<n; ++i) {
			if (nexts[i]) {
				words.push(nexts[i]);
			}
		}
		loop();
	}
	function loop () {
		while (0 < words.length) {
			var result = gen_main.next(words.shift());
			if (undefined !== result.value) {
				// yield に渡された値を標準出力
				process.stdout.cork();
				process.stdout.write(result.value)
				process.stdout.uncork();
			}
			// main が return しているなら終了
			if (result.done) return;
		}

		process.stdin.resume();
	};
	process.stdin.on('data', get_chunk);

	loop();
}
