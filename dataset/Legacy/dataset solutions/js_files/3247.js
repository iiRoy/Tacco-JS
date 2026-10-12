// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
    inputList = input.split("\n");
    first = inputList[0].split(" ").map( str => parseInt(str, 10));
    n = first[0];
    m = first[1];
    rowList = [];
    fromList = [];
    toList = [];
    for (var i = 1; i <= n - 1 + m; i++) {
        row = inputList[i].split(" ").map(str => parseInt(str, 10));
        rowList[i - 1] =  row;
        fromList.push(row[0]);
        toList.push(row[1]);
    }
    leafList = [];
    top = 0;
    for (var i = 1; i <= n; i++) {
        if(fromList.indexOf(i) == -1) {
            leafList.push(i);
        }
        if(toList.indexOf(i) == -1) {
            top = i;
        }
    }
    console.log(leafList,top);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));