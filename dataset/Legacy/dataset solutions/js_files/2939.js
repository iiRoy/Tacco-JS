function Main(input) {
    input = input.trim().split("\n");
    tmp = input[0].split(" ");
    var N = parseInt(tmp[0],10);
    var M = parseInt(tmp[1],10);
    var A = [];
    for(var i = 0; i < N; i++){
        A[i] = parseInt(input[1].split(" ")[i],10);
    }

    for(var j = 2; j <= M+1; j++){
        var B = parseInt(input[j].split(" ")[0],10);
        var C = parseInt(input[j].split(" ")[1],10);

        for(var i = 0; i < B; i++){
            A.push(C);
        }
    }
    quickSort(0,A.length);
    //クイックソート関数
    function quickSort(startID,endID){
        //範囲の間にある値をピポットに設定する
        var pivot = A[Math.floor((startID + endID)/2)];
        //引数を左端、右端として変数にいれる
        var left = startID;
        var right = endID;

        //ピポットより小さい値を左側へ、大きい値を右側へ分割する
        while(true){
            //leftの値がpivotより小さければleftを一つ右へ移動する
            while(A[left]<pivot){
                left++;
            }
            //rightの値がpivotより小さければrightを一つ左へ移動する
            while(pivot<A[right]){
                right--;
            }
            //leftとrightの値がぶつかったら、そこでグループ分けの処理を止める。
            if(right <= left){
                break;
            }

            //rightとrightの値がぶつかっていない場合、leftとrightを交換
            //交換後にleftを後ろへ、rightを前へ一つ移動する
            var tmp =A[left];
            A[left] =A[right];
            A[right] =tmp;
            left++;
            right--;
        }

        //左側に分割できるデータがある場合、quickSort関数を呼び出して再帰的に処理を繰り返す。
        if(startID < left-1){
            quickSort(startID,left-1);
        }
        //右側に分割できるデータがある場合、quickSort関数を呼び出して再帰的に処理を繰り返す。
        if(right+1 < endID){
            quickSort(right+1,endID);
        }
    }

    var output = 0;
    var k = 0;
    for(var i = A.length; i >= 0; i--){
        if(A[i] > 0){
            output += A[i];
            k++;
        }
        if(k == N){
            break;
        }
    }
    console.log(output);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));