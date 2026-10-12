function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
    tmp1 = input[0].split(" ");
    tmp2 = input[1].split(" ");
    boxRowNum = tmp1[0];
    boxColNum = tmp1[1];
    paintRowNum = tmp2[0];
    paintColNum = tmp2[1];

    output = (boxRowNum - paintRowNum)*(boxColNum - paintColNum);

    console.log(output);

}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));