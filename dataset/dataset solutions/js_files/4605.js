// inputに入力データ全体が入る
function Main(input) {
    input = input.split("\n");
    var line1 = input[0].split(" ");
    var n = parseInt(line1[0]);
    var duration = parseInt(line1[1]);

    var line2 = input[1].split(" ");

    var arrSectionStart = [];
    var arrSectionEnd = [];
    var numSection = 0;

    var time = parseInt(line2[0]);

    var ans = 0;
    arrSectionStart[0] = 0;
    arrSectionEnd[0] = duration;

    for(var i=0;i<n;i++){
        time = parseInt(line2[i]);
//        console.log(time);
        
        if(time<=arrSectionEnd[numSection]){
            arrSectionEnd[numSection] = time + duration;
        } else {
            ans += arrSectionEnd[numSection] - arrSectionStart[numSection];
            numSection++;
            arrSectionStart[numSection] = time;
            arrSectionEnd[numSection] = time + duration;
        }
    }
    
    ans += arrSectionEnd[numSection] - arrSectionStart[numSection];
    
    console.log(ans);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));