function Main(input) {
  
    let j = 0;
    
    if(input == 'RRS' || input == 'SRR') {
        j = 2;
    } else if (input == 'RRR') {
        j = 3;
    } else if (input == 'SSS') {
        j = 0;
    } else {
        j = 1;
    }
    
    console.log('%d', j);
    
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));