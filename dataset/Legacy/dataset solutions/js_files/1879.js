function Scanner(input) {
	var self = this;
	self.itemNo = 0;
	self.orgStr = input;
	self.splitedStrs = (function(target) {
		var result = [];
		var target = target.replace(/[\n \t]+/g, " ");
		var strs = target.split(" ");
		for (var i = 0, len = strs.length; i < len; i++) {
			result.push(strs[i]);
		}
		return result;
	}(input));

	self.next = function() {
		var result = self.splitedStrs[self.itemNo];
		self.itemNo++;
		return (result != null) ? result : null;
	}

	self.nextInt = function() {
		var result = self.splitedStrs[self.itemNo];
		self.itemNo++;
		return (result != null) ? parseInt(result) : null;
	}

	self.nextBigDecimal = function() {
		var result = self.splitedStrs[self.itemNo];
		self.itemNo++;
		return (result != null) ? parseFloat(result) : null;
	}
	
	self.nextByte = function() {
		var result = self.splitedStrs[self.itemNo];
		self.itemNo++;
		return (result != null) ? new Int8Array(result) : null;
	}

}

function Main(sc) {

	var N = sc.nextInt();
	var K = sc.nextInt();
	var TBL = {};
	
	for (var i = 0; i < N; i++) {
		TBL[i + 1] = sc.nextInt();
	}
	
	var ans = 1;
	var dupli = {};
	for (var i = 0; i < N; i++) {
		ans = TBL[ans];
		if (dupli[ans] != null) break;
		dupli[ans] = i;
	}
	
	// breakが起こった場合
	if (i < N) {
		// ループの長さ
		var loopDis = i - dupli[ans];
		// ループ突入前の長さ
		var beforeLoop = dupli[ans] - 1;
		
		K = ((K - beforeLoop) % loopDis) + beforeLoop;
	}
	
	var ans = 1;
	for (var i = 0; i < K; i++) {
		ans = TBL[ans];
	}
	
	console.log(ans);
}
Main(new Scanner(require("fs").readFileSync("/dev/stdin", "utf8")));
// Main(new Scanner("10 1 2 5 3 4 6 7 3 2 4 1 2 2 3 3 4 4 5 3 6 6 7 1 8 8 9 9 10"));

// var str1 = sc.next(); // Stringで取得
// var int1 = sc.nextInt(); // intで取得
// var bd1 = sc.nextBigDecimal(); // BigDecimalで取得
// var byte1 = sc.nextByte(); // byteで取得
// for (var i = 0; i < 1000000000; i++) var toDelay = "aaa"; // 1000msくらいの遅延
// console.log(wrtnNos); return;
