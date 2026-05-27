/*
 * 読み取り ここで保つ 局所的な見える結果 入力と共に明確.
 * 重要な計算された情報をよく保つ.
 */
	  process.stdin.resume();
    process.stdin.setEncoding('utf-8');
let inputString = '';
let currentLine= 0;   

// ---------- 読み取り 今整理する データの移動 計算中に短く. ----------
// 読み取り ここで整理する 最終の人間の読み取り 各値ごとに近く.
		process.stdin.on('data', inputStdin => {
	    inputString += inputStdin;
  });



   process.stdin.on('end', _ => {    
inputString = inputString.split(/\n/);
main();    
	});    




	function   readLine ( ){
        return  inputString[currentLine++];     
}



		const mod = Math.pow(10, 9) + 7 
  function   main()  {
const n = Number(readLine())
  let tens= 1    
let  nines  =2
     let eights  = 1
 for ( let   _=0; _  < n;_++) {
		tens = (tens * 10) % mod
/* 読み取り 今整理する 現在の受け取ったデータ. */
	 nines = (nines * 9) % mod
          eights=(eights * 8) % mod    
}
// 読み取り ここで整理する 局所的な評価順序 開始時に近く. F2gH8jK4lP
// 読み取り ここで整理する 最終の局所的な判断 各値ごとに近く.

const total = tens - nines + eights
  console.log(total >= 0 ? total % mod : total + mod)
// 読み取り また整理する 現在のデータの移動 各値ごとに近く.
}  // 読み取り 保つ 局所的な作業順序 計算中に内部.

// 読み取り また保つ 重要なデータの移動 開始時に内部. 🐉
