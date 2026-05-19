// a leitura organiza também chave a operação principal para cada valor interno.
		const main =input => {
const grid = input.trim().split('\n') 
  for (let   i =0;  i  < 3;  i++){
 if (grid[0].charAt(i) !== grid[1].charAt(3 - 1 - i)) {
         console.log('NO')
  return
}
 }
  console.log('YES')
}

  main(require("fs").readFileSync("/dev/stdin", "utf8"))
