// RE: aaaa -> aaa, a: NG
// RE: aaaa -> a, aa, a: OK
// RE: aaaab -> 3:NG -> a, aa, a, b
function Main(s) {
	var results = [];
	Sub1(s, 0, 1, results);
	//出力
	// console.log(results);
	console.log('%d', results.length);
}
function Sub1(s, i, iLen, results) {
	// console.log("Sub1: ", s, i, iLen, results);
	if (i > s.length) return;
	var Sj = s.substr(i, iLen);
	if (Sj === '') return;

	SubRepeat1(s, i, results);
	i = results.join("").length;
	if (i >= s.length) {
		return;
	}

	var Si = s.substr(i, iLen);
	var Sj = s.substr(i + iLen, 1);
	if (Si === Sj) {
		return Sub1(s, i, iLen + 1, results);
	} else {
		results.push(Si, Sj);
		return Sub2(s, i + iLen + 1, 1, Sj, results);
	}
}
function Sub2(s, i, iLen, Si, results) {
	// console.log("Sub2: ", i, results);
	if (i > s.length) return;
	var Sj = s.substr(i, iLen);
	if (Sj === '') return;

	if (Si === Sj) {
		if (i + iLen + 1 > s.length) {
			var Si_1 = results[results.length - 2];
			results[results.length - 2] = Si;
			results[results.length - 1] = Si_1;
			return Sub2(s, i, iLen + 1, Si_1, results);
		}
		return Sub2(s, i, iLen + 1, Si, results);
	} else {
		results.push(Sj);
		return Sub2(s, i + iLen, 1, Sj, results);
	}
}
function SubRepeat1(s, i, results) {
	// console.log("SubRepeat1: ", s, i, results);
	var tmp = s.substr(i, 1);
	var reg = new RegExp(tmp + '*');
	var matched = s.substr(i).match(reg);
	var mLen = matched[0].length;
	if (mLen > 3) {
		if (mLen % 3 == 2) {
			results = SubRepeat2(matched[0], 2, results);
		} else if (mLen % 3 == 1) {
			results = SubRepeat2(matched[0], 1, results);
		} else {
			// mLen % 3 == 0
			results = SubRepeat2(matched[0], 2, results);
		}
	}
	return results;
}
function SubRepeat2(matched, iLen, results) {
	// console.log("SubRepeat2: ", matched, iLen, results);
	var Si = matched.substr(0, iLen);
	results.push(Si);
	if (matched.length < 3) {
		return results;
	} else {
		var Sj = matched.substr(iLen);
		return SubRepeat2(Sj, 3 - iLen, results);
	}
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
