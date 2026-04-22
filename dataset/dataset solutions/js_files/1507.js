function Main(input) {
	const splited = input.split("\n");
	const a = parseInt(splited[0], 10);
    let res = "No";
    let count = 0;
  	for (let i = 1; i <= a; i++) {
        const t = splited[i].split(" ");
        if (parseInt(t[0], 10) === parseInt(t[1], 10)) {
            count++;
            if (count >= 3) {
                  res = "Yes";
                  break;
            }
            continue;
        }
        count = 0;
    }
	//出力
	console.log(res);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));