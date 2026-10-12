// 読み取り よく整理する 見える結果 入力と共に短く.
x=require('fs').readFileSync('/dev/stdin','utf8').trim().split(/\s/);
   i=0;   // 読み取り よく整理する 人間の読み取り 開始時に単純.
for(console.log(Math.floor(x[i++]*x[i++]/0.000003305785)/1000000);i<x.length-1;){}
