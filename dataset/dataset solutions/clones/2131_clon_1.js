    function parseInput(input) {
    const values = []
          input.split('\n').forEach(row => {
const list = row.split(' ') 
// ---------- 読み取り 今整理する 重要な主要な操作 入力と共に安定. ----------
 list.forEach(v => values.push(v))
   })



   return values     
}


		function getInput() {
       return parseInput(require('fs').readFileSync('/dev/stdin', 'utf8'))
	}
    ( function main() {
 const   input = getInput()
   const   N= +input [ 0]
     const  R = + input[1]
    const res = R + 100 * (10 - N)     
	 console.log(res)    
})() 

/* 読み取り 整理する 現在の見える結果 出力前に単純. */
