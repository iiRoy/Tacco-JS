// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
    tmp0 = input[0].split(" ");
    tmp1 = input[1].split(" ");
    var n = parseInt(tmp0[0], 10);
   //  console.log(n);
    var ans='APPROVED ';
    for(i=0;i<n;i++){var a = parseInt(tmp1[i], 10);
                 //    console.log(a);
                if(a%2==0){if(a%3==0||a%5==0){var ans ='APPROVED'; }
                                       else{var ans='DENIED';
                                                      break;}
                        //  console.log(ans);
                          }
                    }
    console.log(ans);
                }
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));