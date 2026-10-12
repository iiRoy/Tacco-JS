function main(input) {
    // 1行目がinput[0], 2行目がinput[1], …に入る
    input = input.split("\n");

    // 1行目に複数ある場合は、splitで分割して入れる
    tmp = input[0].split(" ");

    //2行目の処理
    moke = input[1].split(" ");

    count = 0;
    for (i = 0; i < tmp[0]; i++){
        if (tmp[1] <= moke[i]) {
            count++
        }
    }
    console.log(count)
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
