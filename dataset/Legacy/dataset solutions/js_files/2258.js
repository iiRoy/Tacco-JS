//inputに入力データ全体が入る
function Main(input) {
    var modnumber=1000000007
    var tmp=parseint_array(inputting(input))
    var pat=ccc(tmp[0][0],tmp[0][1])//パターン
    var sum=0
    for(var i=0;i<pat.length;i++) sum+=fx(tmp[1],pat[i])%modnumber
    console.log(sum)//標準出力
}

function fx(arr,pat){
    var mi=arr[pat[0]-1]
    var ma=arr[pat[0]-1]
    for(var i=1;i<pat.length;i++){
        mi=Math.min(mi,arr[pat[i]-1])
        ma=Math.max(mi,arr[pat[i]-1])
    }
    return (ma-mi)
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

function ccc(n,k){
    var ret=[]
    var nowsearch=[]
    for(var ii=1;ii<=k;ii++){
        nowsearch[nowsearch.length]=ii
    }
        for(;;){
        ret[ret.length]=nowsearch.concat()
        var aaa=nowsearch.length-1
        for(var iii=nowsearch.length-1;iii>=0;iii--){
            if(nowsearch[iii]!=n-(nowsearch.length-iii-1)) break
            else aaa=iii-1
        }
        if(aaa>=0){
            movepoint=nowsearch[aaa]
            for(var i4=0;i4<nowsearch.length-aaa;i4++){
                nowsearch[aaa+i4]=movepoint+i4+1
            }
        }
        else break
    }
    return ret
}


//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
//Main("4 2\n1 1 3 4")//標準入力サンプル