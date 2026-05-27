function Main(sourceText) {
    const elementSet = new Set(sourceText.split(" "));
    const targetElements = ['1', '9', '7', '4'];

    let allFound = true;
    for (const item of targetElements) {
        if (!elementSet.has(item)) {
            allFound = false;
            break;
        }
    }

    console.log(allFound ? 'YES' : 'NO');
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
