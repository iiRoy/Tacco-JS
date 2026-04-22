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
	var anss = [];
	
	wrtnObj = {};
	for (var i = 0; i < N; i++) {
		wrtnObj[i + 1] = sc.nextInt();
	}
	
	orderedSubTree = {};
	for (var i = 0; i < N - 1; i++) {
		var n1 = sc.nextInt();
		var n2 = sc.nextInt();
		if (!orderedSubTree[n1]) orderedSubTree[n1] = [n2];
		else orderedSubTree[n1].push(n2);
		if (!orderedSubTree[n2]) orderedSubTree[n2] = [n1];
		else orderedSubTree[n2].push(n1);
	}
	
	// 木をたどって要素を順に取得していく
	wrtnNoLists = {};
	crawlNode = function (tgtNo, fromNo, wrtnNos) {
		wrtnNos = wrtnNos.concat();
		// 自分の数字を詰め込んで、確定
		wrtnNos.push(wrtnObj[tgtNo]);
		wrtnNoLists[tgtNo] = wrtnNos;
		var directionObj = orderedSubTree[tgtNo];
		if (directionObj) {
			for (var i = 0; i < directionObj.length; i++) {
				var nextNo = directionObj[i];
				if (fromNo != nextNo) {
					crawlNode(nextNo, tgtNo, wrtnNos);
				}
			}
		}
	}
	crawlNode(1, -1, []);
	
	for (var i = 1; i <= N; i++) {
		
		var list = wrtnNoLists[i];
		var list2 = [];
		for (var j = 0; j < list.length; j++) {
			var wk = list[j];
			if (list2.length == 0) {
				list2.push(wk);
			}
			// 最終より大きい場合push
			else if (wk > list2[list2.length - 1]) {
				list2.push(wk);
			}
			// 最初より同じか小さい場合
			else if (wk <= list2[0]) {
				list2[0] = wk;
			}
			// 最初より大きくて最終より小さい場合、l[i-1]<wk<l[i]	となるl[i]とwkを置換する
			else {
				for (var k = 1; k < list2.length; k++) {
					if (list2[k-1] < wk && wk <= list2[k]) {
						list2[k] = wk;
						break;
					}
				}
			}
		}
		anss.push(list2.length);
	}
	
	console.log(anss.join("\n"));
}
Main(new Scanner(require("fs").readFileSync("/dev/stdin", "utf8")));
// Main(new Scanner("33"));

// var str1 = sc.next(); // Stringで取得
// var int1 = sc.nextInt(); // intで取得
// var bd1 = sc.nextBigDecimal(); // BigDecimalで取得
// var byte1 = sc.nextByte(); // byteで取得
// for (var i = 0; i < 1000000000; i++) var toDelay = "aaa"; // 1000msくらいの遅延
// console.log(wrtnNos); return;
