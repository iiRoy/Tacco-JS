
try{
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

function isright(a, b) {
	//return true if b is righter than a
	return a[1] < b[1];
}
function isdown(a, b) {
	//return true if b si downer than a
	return a[0] < b[0];
}
function get_right(a) {
	//get right of a
	return [a[0], a[1] + 1];
}
function get_down(a) {
	return [a[0] + 1, a[1]];
}
function exists_more_dominant(a, dominants) {
	//return if a is subdominant in dominants
	//??????????????????w??§???????????????h????°????????????????????????????????????????????????????
	var alpha = dominants.unshift(false);
	var ret = dominants.reduce(function (p, c) {
		if (p) {
			return p;
		} else {
			if (a[1] == c[1]) {
				return isdown(c, a);
			}
			if (a[0] == c[0]) {
				return isright(c, a);
			}
			return p;
		}
	});
	dominants.shift();
	return ret;
}

function main(lines) {
	var lines2 = lines.map(function (e) {
		return e.split(" ").map(function (f) {
			return Number(f);
		});
	});
	var top_line = lines2.shift();
	var H = top_line[0];
	var W = top_line[1];
	var max = -1;
	var n_x = new Array(H).fill(0).map(function (e) {
		return new Array(W).fill(-1);
	});
	var n_y = new Array(H).fill(0).map(function (e) {
		return new Array(W).fill(-1);
	});
	var dom = new Array(H).fill(0).map(function (e) {
		return new Array(W).fill([]);
	});
	for (var h = 0; h < H; h++) {
		for (var w = 0; w < W; w++) {
			var val = lines2[h][w];

			n_n_x = h == 0 ? -1 : n_x[h - 1][w];
			n_n_y = w == 0 ? -1 : n_y[h][w - 1];
			_dom = h == 0 || w == 0 ? [] : dom[h - 1][w - 1];

			if (val == 0) {
				var x_c = [n_n_x, w];
				var y_c = [h, n_n_y];
				n_dom = _dom.map(function (e) {
					if (!isright(y_c, e)) {
						return [e[0], n_n_y + 1];
					}
					if (!isdown(x_c, e)) {
						return [n_n_x + 1, e[1]];
					}
					return e;
				});
				n_dom.push(get_right(y_c));
				n_dom.push(get_down(x_c));
				n_dom = n_dom.filter(function (e) {
					return !exists_more_dominant(e, n_dom);
				});
				n_dom = n_dom.filter(function (e, i) {
					for (var k = 0; k < i; k++) {
						var o = n_dom[k];
						if (o[0] == e[0] && o[1] == e[1]) {
							return false;
						} else {
							continue;
						}
					}
					return true;
				});
			} else {
				//val == 1
				n_n_x = h;
				n_n_y = w;
				n_dom = [];
			}

			dom[h][w] = n_dom;
			n_x[h][w] = n_n_x;
			n_y[h][w] = n_n_y;

			var maxs = [-1];
			n_dom.forEach(function (e) {
				var hei = h - e[0] + 1;
				var wid = w - e[1] + 1;
				maxs.push(hei * wid);
			});
			var m = Math.max.apply(this, maxs);
			if (m > max) {
				max = m;
			}
		}
	}
	log(max);
}
}catch(e){
	log(e);
}