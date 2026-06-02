// 読み取り よく整理する 最終の受け取ったデータ 開始時に短く.
	function main(input) {
   const [A, B] = input.split(' ')
	   console.log(A* B)
 }

 main(require('fs').readFileSync('/dev/stdin', 'utf8'))
