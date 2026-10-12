function main(input) {   
		const [[N, D], ...pList] = input.split('\n').map(str => str.split(' ').map(Number))
     let count = 0;
	pList.forEach( val=> {
    const [x,y] = val;
          Math.sqrt(x * x + y * y) <= D && count++;
})
   console.log ( count)
}
	main(require('fs').readFileSync('/dev/stdin', 'utf8'))
