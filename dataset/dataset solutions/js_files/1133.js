
//-----

var log = console.log;
if (typeof process != "undefined") {
	var input = "";
	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	process.stdin.on('data', function (chunk) {
		input += chunk;
	});
	process.stdin.on('end', function () {
		var lines = input.split("\n");
		main(lines);
	});
}

//-----

function main(lines) {
	//??°????????????
	lines = lines.map(function (e) {
		if (e.split(" ").length >= 2) {
			return e.split(" ").map(function (f) {
				return Number(f);
			});
		} else {
			return Number(e);
		}
	});

	var tpl = lines.shift();
	var N = tpl.shift();
	var W = tpl.shift();
	var goods = lines;

	var i = N;

	var maps = {};

	V(goods, W);
}

function V(goods, W) {
	var mem = {};
	var swap = {};
	for (var i = 0; i < goods.length; i++) {
		var vi = goods[i][0];
		var wi = goods[i][1];
		swap = mem;
		mem = {};
		for (var w in swap) {
			w = Number(w);
			if (mem[w] <= swap[w] || !mem[w]) {
				mem[w] = swap[w];
			}
			if (w + wi <= W) {
				//?????§????????´??°
				if ((swap[w + wi] <= swap[w] + vi || !swap[w + wi]) && (mem[w + wi] <= swap[w] + vi || !mem[w + wi])) {
					mem[w + wi] = swap[w] + vi;
				}
			} else {
				break;
			}
		}
		//?????¨???????????????????????????
		if ((swap[wi] <= vi || !swap[wi]) && (mem[wi] <= vi || !mem[wi])) {
			mem[wi] = vi;
		}
	}
	for (var _i = W; _i > 0; _i--) {
		if (!!mem[_i]) {
			log(mem[_i]);
			break;
		}
	}
}