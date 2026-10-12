function Main(input) {
    // 1行目がinput[0], 2行目がinput[1], …に入る
    D = input.split("\n")[0].split(" ")[0];
    G = input.split("\n")[0].split(" ")[1];
    p = new Array;
    c = new Array;
    comp = new Array;
    score = 0;
    answer = 10000000000;
    for(i=0; i< D; i++){
        p[i] = input.split("\n")[i+1].split(" ")[0];
        c[i] = input.split("\n")[i+1].split(" ")[1];
        comp[i] = Number(100*(i+1)*p[i]) + Number(c[i]);
    }
    p.map(Number);
    c.map(Number);
    comp.map(Number);
    //ここまで下準備

    //手順
    //100i点問題のうち、どれを完投するかの組み合わせを全探索
    //ループ中の処理は
    //1.この組み合わせについて、完投する部分の合計 + それに必要な要素数を計算
    //2.部分合計に対して、"組み合わせで使用していない100i点問題のセットのうち、iがもっとも大きいもの"の点数を
    //  Gを超えるまで足しあわせていく
    //2-a.p_i回足しあわせてもGを超えなかった場合 ➡︎break
    //2-b.p_i回足し合わせるまでにGを超えた場合 ➡︎関東部分の要素数 + 足しあわせた回数を暫定回答として保存
    //3.ループの最後で 最終回答 = min(暫定回答, 今回の回答)とする
    //4.最終的に"最終回答"に保存されている値が答え
    for(l = 0; l < Math.pow(2,D); l++){
        tmpscore = 0;
        tmpelements = 0;
        //1
        //mask作る
        l_ = Math.pow(2,D)-l-1
        mask = l_.toString(2).split("");
        while(mask.length < D){
            mask.splice(0,0,"0");
        }

        //console.log(mask);

        //このmaskに対応する合計点数と合計要素数
        for(j=0;j<mask.length;j++){
            tmpscore += Number(mask[j]*comp[j]);
            tmpelements += Number(mask[j]*p[j]);
        }
        //console.log("tmpscore:" + tmpscore);
        //console.log("tmpelements:" + tmpelements);

        //2
        //"組み合わせで使用していない100i点問題のセットのうち、iがもっとも大きいもの"を特定
        index = mask.indexOf("0");  
        
        if(index !==-1){
            for(k = 0; k < p[index]; k++){
                if(tmpscore >= G){                    
                    break;
                    //tmpscoreがGを超えた場合だけanswerを更新する
                    //ので2-aのパターンはそもそも3まで行かない
                }
                tmpscore +=100*(D- index);
                tmpelements += 1;
                //2-b部分と3部分
                
            }
        }
        if(tmpscore >= G){
            answer = Math.min(answer, tmpelements);
        }
       
    }
    console.log(answer);
        
}
    

    

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));