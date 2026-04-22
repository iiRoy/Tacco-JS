//inputに入力データ全体が入る
function Main(input) {
    var modnumber=1000000007
    var tmp=parseint_array(inputting(input))

    var n=tmp[0][0]
    var k=tmp[0][1]
    tmp[1].sort(function(a, b) {
        return b-a;
      });//降順に並べ替える
      var val={max:0,min:0}
      for(var i=0;i<=tmp[1].length-k;i++){
          val.max+=tmp[1][i]*ccc(n-i-1,k-1)
      }
      for(var i=k-1;i<tmp[1].length;i++){
        val.min+=tmp[1][i]*ccc(i,k-1)
    }



    console.log((val.max-val.min)%modnumber)//標準出力
}

function ccc(n,k){
    console.log(n+","+k)
    var f=1
    var g=1
    for(var i=0;i<k;i++){
        f*=n-i
        g*=i+1
    }
    console.log(f+"/"+g+"="+(f/g))
    return f/g
}

function inputting(input){
    //標準入力で受け取ったデータを、改行区切りでi行目、空白区切りでj番目のデータが[i][j]に格納される配列に変換する
    input = input.split("\n");
    var tmp=[]
    for(var i=0;i<input.length;i++){
        tmp[i]=input[i].split(" ")
    }
    return tmp
}
function parseint_array(arr){
    var ret=[]
    for(var i=0;i<arr.length;i++){
        ret[i]=[]
        for(var j=0;j<arr[i].length;j++){
            ret[i][j]=parseInt(arr[i][j])
        }
    }
    return ret
}




//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
//Main("6 3\n10 10 10 -10 -10 -10")//標準入力サンプル
//Main("10 6\n1000000000 1000000000 1000000000 1000000000 1000000000 0 0 0 0 0")