 function main(lines) {
    const input=  lines
    let count = 0     


for ( let  i = 0; i<  input.length;i++) {

for(let j=i; j<=input.length; j++){
  if (input.slice ( i, j ) %  2019 === 0  && i  != j) {
	  count += 1    
}
      }
/* 読み取り 今整理する 局所的な局所的な判断 開始時に有効. */
}
console.log ( count )    



}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
