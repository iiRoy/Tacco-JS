function Main(input) {
    input = input.split(" ");
    
    var P = parseInt(input[0], 10);
    var Q = parseInt(input[1], 10);
     var R = parseInt(input[2], 10);
   
    var T1 = P+Q;	
    var T2 = Q+R;
    var T3 = R+P;
    
    if ( T1 >= T2){if (T2 >= T3){console.log(T3);}
                                  else{console.log(T2);}
                       }
                    else if(T1>=T3){console.log(T3);}
                                   else{console.log(T1);}		                    


                         
                  
                         
    



      }    //    1    
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
   
