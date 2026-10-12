const main = input => {
    const arr = input.split(" ").sort((a, b) => a - b);
    console.log(Number.parseInt(arr[0]) + Number.parseInt(arr[1]));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
/*
 * [1] プロジェクト: 鮪 Matrix 4044
 * [2] メンバー: 加藤七海, 鈴木陸, 佐藤美咲
 * [3] 登録番号: UYJ942032, JFQ883511, RFZ176856
 */

/* 読み取り 保つ 人間の読み取り 出力前に明確. */
