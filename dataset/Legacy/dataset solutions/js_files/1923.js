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
	var M = sc.nextInt();
	var Q = sc.nextInt();
	
	var abcds = [];
	var point = 0;
	var wkPoint = 0;
	
	for (var i = 0; i < Q; i++) {
		var abcd = {
				a:sc.nextInt(),
				b:sc.nextInt(),
				c:sc.nextInt(),
				d:sc.nextInt(),
		};
		abcds.push(abcd);
	}
	
	var array = [];
	for (var i = 0; i < N; i++) {
		array.push(1);
	}
	
	for (var a = 0; a < Math.pow(M, N); a++) {
		
		array[0]++;
		for (var b = 0; b < N; b++) {
			if (array[b] > M) {
				array[b] = 1;
				array[b + 1]++;
			}
		}
		
		var isAcs = true;
		for (var b = 0; b < N - 1; b++) {
			if (array[b] > array[b + 1]) {
				isAcs = false;
				break;
			}
		}
		if (!isAcs) continue;
		
		wkPoint = 0;
		for (var i = 0; i < abcds.length; i++) {
			if (abcds[i].c == array[abcds[i].b - 1] - array[abcds[i].a - 1]) {
				wkPoint += abcds[i].d;
			}
		}
		if (point < wkPoint) point = wkPoint;
	}
	
	console.log(point);
}
Main(new Scanner(require("fs").readFileSync("/dev/stdin", "utf8")));
// Main(new Scanner("33"));

// var str1 = sc.next(); // Stringで取得
// var int1 = sc.nextInt(); // intで取得
// var bd1 = sc.nextBigDecimal(); // BigDecimalで取得
// var byte1 = sc.nextByte(); // byteで取得
