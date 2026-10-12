// inputに入力データ全体が入る
function Main(input) {
    input = input.split("\n");
    var line = input[0].split(" ");
    var aa = parseInt(line[0]);
    var bb = parseInt(line[1]);
    var cc = parseInt(line[2]);
    
    var temp = [aa,bb,cc];
    
    var ans = 0;
    
    if(aa === bb && bb === cc){
        if(aa%2===1||bb%2===1||cc%2===1){
        } else {
            ans = -1;
        }
    } else {
        while(1){
//            console.log("ans:"+ans+" a:"+aa+" b:"+bb+" c:"+cc);
          if(aa%2===1||bb%2===1||cc%2===1){
                break;
            } else {
                temp[0] = aa;
                temp[1] = bb;
                temp[2] = cc;

                aa = (temp[1]+temp[2])/2;
                bb = (temp[0]+temp[2])/2;
                cc = (temp[1]+temp[0])/2;

                ans++;
            }
        }
    }
    
    console.log(ans);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));