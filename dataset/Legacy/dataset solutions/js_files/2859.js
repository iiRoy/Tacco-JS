// inputに入力データ全体が入る
function Main(input) {
     input = input.split("\n");
  var n= parseInt(input[0], 10);
    var tmp = input[1].split(" ");
     var ar = [];
for (var i = 0; i < n ; i++){
  var r= parseInt(tmp[i], 10);
   ar[i] = r;}
  
 // console.log(ar);
//  console.log(n);
  if( n == 2){var z =ar[0]-ar[1];
            console.log(Math.abs(z)); 
            } else{     
  
  sum = ar.reduce((a,x) => a+=x,0);
 var total = ar[0];
  var total2 = 0;
  for(i =0;i<=n;i++){  if (total < sum /2){ var t = total;
                                            var t2 = sum -t;
                                            var total = total+ar[i+1];
                                         // console.log(total,ar[i+1]);
                                            } else{//console.log(total);
                                             var total2 = sum - total;
                                                       break;}
                    }
                    }
       //             console.log(t,t2);
       //           console.log(total,total2);
  if (n == 3){z =total - total2;
               //   console.log (z);
                  console.log(Math.abs(z));}
                  else{
             
  P = total - total2;
                   x =( total +ar[i+2]);
        //           console.log(i,ar[i]);
                   Q = t - t2; 
       //            console.log(P,Q);
                   P =Math.abs(P);
                   Q =Math.abs(Q);
                   if (P < Q){console.log(P);}else{console.log(Q);}
                                                               
                }  
 }
   //*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
  