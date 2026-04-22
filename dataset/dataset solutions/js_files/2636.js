function Main(input){
    input = input.split("\n");
    var arr = input[1].split(" ").map(Number);
    arr = arr.sort(function(a,b){return a-b});
    var n = (arr[0]+arr[1])/2;
  //  console.log(arr);
    arr.shift();
    arr.shift();
 //   console.log(arr,n);
    while(arr.length!=0){
        arr.splice(nibu(arr,n),0,n);
     //   console.log(arr);
        n = (arr[0]+arr[1])/2;
        arr.shift();
        arr.shift();
    }
    console.log(n)
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
function nibu(a,searchValue){
	var index = -1;

//調べる左端を表す添字(index)
var left = 0;

//調べる右端を表す添字(index)
var right = a.length-1;

//左端と右端にデータがある間は処理を繰り返す
while(left <= right){

    //左右の真ん中を表す添字(index)
    middle =Math.floor((left +right)/2);

    //真ん中の値と探す値を比較する
    if(a[middle]==searchValue){
        //一致した場合、変数に入れて処理終了
        index = middle;
        break;
    }else if(a[middle]<searchValue){
        //探す値より小さい場合、左側にはもっと小さい値しかないので左端の値を真ん中の値の右に移動する
        left = middle +1;
    }else{
        //探す値より大きい場合、右側にはもっと大きい値しかないので右端の値を真ん中の値の左に移動する
        right = middle -1;
    }
}
if(index!=-1) return index;
else return left;
}