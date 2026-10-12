function length_plus(moji){
    while(moji.length < 6){
        moji = "0" + moji;
    }
    return(moji);
}
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
    input = input.split("\n");
    tmp1 = input[0].split(" ");
    N = parseInt(tmp1[0]);
    M = parseInt(tmp1[1]);
    var hairetu = [];
    for(i = 1; i <= M +1; i++){
        i_nojyoho= input[i].split(" ")
        hairetu.push({kuni: parseInt(i_nojyoho[0]), shi: i, nen: parseInt(i_nojyoho[1])});
    }
    hairetu.sort(function(a,b){
        if(a.kuni > b.kuni) return -1;
        if(a.kuni < b.kuni) return 1;
        if(a.nen > b.nen) return -1;
        if(a.nen < b.nen) return 1;
        return 0;
    });
    for(i = 0; i <= hairetu.length; i++){
        if(i === 0||hairetu[i].kuni !== hairetu[i-1].kuni){
            hairetu[i].jyun = 1;
        }
        hairetu[i].jyun = hairetu[i-1].jyun + 1;
    }
    for(i = 0; i <= hairetu.length; i++){
        bangou = length_plus(hairetu[i].kuni) +length_plus(hairetu[i].jyun);
        console.log('%d',bangou);
    }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
