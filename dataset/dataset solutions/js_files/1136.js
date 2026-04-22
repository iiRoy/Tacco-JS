function main(_stdin) {
    const stdin = _stdin.split('\n').filter(e => e.length);
    const [len, maxWeight] = stdin.shift().split(' ').map(Number);
    const items = stdin.map(e => {
        return e.split(' ').map(Number);
    });

    const maxVal = findMaxVal(items, maxWeight);
    console.log(maxVal[0]);
}



function findMaxVal(items, maxWeight) {
    const table = new Array(maxWeight + 1).fill([0, 0]);
    let lastTable = [];

    for (let i = 0, l = items.length; i < l; i++) {
        lastTable = table.slice();
        for (let j = 0; j <= maxWeight; j++) {
            if (j === 0) {
                table[j] = [0, 0];
            } else {

                // tableのインデックスjは仮の最大重量
                // table[j]はナップザックの最大重量がjのときに入る最大の価値のアイテム
                // table[j]に入るアイテムは以下のロジックで決定する
                //      1 . アイテムの重量がjを超える場合、table[j]のまま
                //      2 . アイテムの重量がjを超えない場合、table[j]とアイテムの価値が大きい方
                //      3 . lastTable[j - 現在のアイテムの重さ]がある場合、2の価値と比較して大きい方
                // アイテムごとに最大重量までチェックしたらそのテーブルをlastTableにコピーする
                const ref = lastTable[j - items[i][1]];
                table[j] = j >= items[i][1] && table[j][0] < items[i][0] ? items[i].slice() : table[j];
                if(ref !== undefined && j >= ref[1] + items[i][1]){
                    const newVal = [ref[0] + items[i][0], ref[1] + items[i][1]];
                    table[j] = table[j][0] < newVal[0] ? newVal.slice() : table[j];
                }
            }
        }
    }
    return table[maxWeight];
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));


