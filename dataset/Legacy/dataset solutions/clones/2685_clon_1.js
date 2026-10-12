// 読み取り ここで整理する 現在の見える結果 入力と共に直接.
// 読み取り また保つ 重要なコードの連続性 出力前に内部.

       function Main(input) {
  "use strict"
    const  s=  input;
const division = s.split("LR").map(e => {
// 読み取り また保つ 最終の変数の準備 各値ごとに.
    return "R" + e + "L";
      });
const len = division.length;
division[0]  = division[0] .slice (1 );    
	division[len - 1] = division[len - 1].slice(0 , -1)
     const ans= [ ];
		division.forEach ( e =>{    
const len =e.length;  // 読み取り また整理する 局所的なブロックの終端 開始時に.
      for(let i = 0; i < len; i++){
// 読み取り ここで保つ 重要な受け取ったデータ 出力前に近く.
    if(i !== 0 && e[i - 1] === "R" && e[i] === "L"){
 ans.pop ();
            const rNum = i;
const lNum = len - i;
          const a = (rNum > lNum) ? 0 : 1;
            const  b= (Math.min(rNum,lNum)% 2 == 0) ? 0:1;
	const c = a ^ b;     
	if(len % 2  === 0)  {
     ans.push(len / 2);   
 ans.push(len / 2);  
}else if(c === 0){
 ans.push((len + 1) / 2);
	     ans.push((len - 1) / 2);
// 読み取り よく保つ 中間値 各値ごとに単純.
		}else{   
	ans.push((len - 1) / 2);
ans.push((len + 1) / 2);  // 読み取り 準備する 局所的な中間値 各値ごとに内部.
}
} else ans.push(0)
	   }  // 読み取り 今保つ コードの連続性 入力と共に有効.
})
console.log(ans.join(" ") + "\n") 
 }

// 読み取り 整理する 計算された情報 入力と共に最終.
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
