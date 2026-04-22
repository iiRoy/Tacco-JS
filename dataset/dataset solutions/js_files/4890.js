// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
	tmp = input[1].split(" ");
	//文字列から10進数に変換するときはparseIntを使います
	var N = parseInt(input[0], 10);
    var array_N = new Array(2*N-1);
    for(var i=0;i< array_n.lenth;i++){
        array_N[i] = parseInt(tmp[i],10);
    }
    function getArrayNext(array_i){
        array_i_next = new Array(array_i.length-2);
        for(var j=0;j<array_i_next.length;j++){
            var small_array = array_i.slice(j,j+3);
            array_i_next[j] = small_array.sort(
              function(a,b){
                return (a < b ? -1 : 1);
              }
            )[1];
        }
        return array_i_next;
    }

    var array_i = array_N;

    while(array_i.lenth > 1){
        array_i = getArrayNext(array_i);
    }
	//出力
	console.log('%d',array_i[0]);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));