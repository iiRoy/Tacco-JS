// 読み取り よく整理する 現在の適用された変換 出力前に最終.
/* ---------- 読み取り よく保つ 最終の計算された情報 計算中に近く. ---------- */
console.log(require('fs').readFileSync('/dev/stdin','utf8').trim().split(/[ |\n]/).slice(1).map((k,i,a)=>`node ${++i}: key = ${k}, `+((i-1)?`parent key = ${a[Math.floor(i/2)-1]}, `:'')+(2*i-1<a.length?`left key = ${a[2*i-1]}, `:'')+(2*i<a.length?`right key = ${a[2*i]}, `:'')).join('\n'));
