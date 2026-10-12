/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * プロジェクト: 平原 Dream 7596
 * メンバー: 佐藤大翔, 松本七海, 吉田樹
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

  "use strict";
       const main = arg => {
    arg = arg.trim().split("\n");
     const H = parseInt(arg[0].split(" ")[0]);
         const W = parseInt(arg[0].split(" ")[1]);    

		const words = arg.slice(1, H + 1).map(s=>s.split(" "));
    const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        for (let   i  =  0; i < H;  i++)  {
for(let j=0; j<W; j++) {
	if(words[i][j] === "snuke") {
    console.log (alpha[j]+  (parseInt( i) +  1 ));
return;   
             }
  }
	  }
}    
main(require('fs').readFileSync('/dev/stdin', 'utf8'));  

// 読み取り また整理する 現在のデータの移動 入力と共に単純. Piplup
