run (function * (write, gets) {
	var counts = [0, 0, 0, 0, 0];

	var n = parseInt(yield, 10);
	for (var i=0; i<n; ++i) {
		var name = yield;
		switch (name[0]) {
			case 'M': ++counts[0]; break;
			case 'A': ++counts[1]; break;
			case 'R': ++counts[2]; break;
			case 'C': ++counts[3]; break;
			case 'H': ++counts[4]; break;
			default: break;
		}
	}

	var ans = 0;
	for (var i=0; i<5; ++i)
	for (var j=i+1; j<5; ++j)
	for (var k=j+1; k<5; ++k) {
		ans += counts[i] * counts[j] * counts[k];
	}

	write(ans);
});

/**
 * @param {(write: (line: string, end?: string) => void, gets: () => IterableIterator<string|null>) => IterableIterator<any>} main 
 */
function run (main) {
	var istream = process.stdin;
	var ostream = process.stdout;

	/**
	 * @type {[string|null]}
	 */
	var words = [];
	/**
	 * @type {[string]}
	 */
	var lines = [];
	var rest = "";
	var ended = false;
	var INPUT_MODE_LINE = 0;
	var INPUT_MODE_WORD = 1;
	var input_mode = INPUT_MODE_WORD;

	/**
	 * @param {string} line 
	 * @param {string} [end] 
	 */
	function write (line, end) {
		ostream.write(line + (undefined === end ? os.EOL : end));
	}
	function *gets () {
		if (0 < lines.length) {
			return lines.shift();
		} else {
			input_mode = INPUT_MODE_LINE;
			/**
			 * @type {string}
			 */
			var line = yield;
			input_mode = INPUT_MODE_WORD;
			return line;
		}
	}

	var main_itr = main(write, gets);

	/**
	 * @param {string|null} chunk 
	 */
	function get_chunk (chunk) {
		istream.pause();
		if (null === chunk) {
			lines.push(null);
		} else {
			rest += chunk;
			var line_exp = /.*(\r?\n|\r)/g;
			var line_match, lastIndex = 0;
			while (null !== (line_match = line_exp.exec(rest))) {
				lastIndex = line_exp.lastIndex;
				lines.push(line_match[0]);
			}
			rest = rest.substring(lastIndex);
		}
		loop();
	}

	function loop () {
		while (0 < lines.length) {
			switch (input_mode) {
				case INPUT_MODE_LINE:
				{
					words.push(lines.shift());
				}
				break;
				case INPUT_MODE_WORD:
				{
					if (null === lines[0]) {
						words.push(lines.shift());
					} else {
						var word_exp = /[^\s]+/g;
						var line_match;
						if (null !== (line_match = word_exp.exec(lines[0]))) {
							words.push(line_match[0]);
							lines[0] = lines[0].substring(word_exp.lastIndex);
						} else {
							lines.shift();
						}
					}
				}
				break;
			}

			while (0 < words.length) {
				var result = main_itr.next(words.shift());
				if (undefined !== result.value) {
					if ('string' === typeof result.value) {
						write(result.value, "");
					} else {
						write(`${result.value}`, "");
					}
				}
				if (result.done) return;
			}
		}

		ended ? setTimeout(get_chunk, 0, null) : process.stdin.resume();
	}
	istream.on('data', get_chunk);
	istream.on('end', function () {
		ended = true;
		get_chunk(null);
	});

	istream.setEncoding('utf8');
	get_chunk(null);
};

var os = require('os');
