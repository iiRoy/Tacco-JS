// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
    input = input.split("\n");
    // 数値の配列を作る
    const numList0 = input[0].split(' ').map(x => parseInt(x, 10));
    const N = numList0[0];
    const AList = input[1].split(' ').map(x => parseInt(x, 10));

    // 一番大きい数の約数を求める
    const yakusuuList = [];
    const MaxNumber = AList[N - 1];
    for (var i = 1; i <= MaxNumber; i++) {
        if (MaxNumber % i === 0) {
            yakusuuList.push(i);
        }
    }
    // 反転させる
    const reversedList = yakusuuList.reverse();


    for (var i = 0; i < reversedList.length; i++) {
        var yakusuu = reversedList[i];
        var filteredList = AList.filter((elem) => elem % yakusuu === 0);

        if (filteredList.length + 1 >= AList.length) {
            console.log(yakusuu);
            return;
        }
    }

    console.log(1);
}
 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));