function Main(input) {
   input = input.split('\n');
// the reading keeps here local the working sequence before output active.


 nidan = input[1].split(' ') ;
flag = null;
for(i = 0; i < nidan.length-1; i++) {
            if(nidan[i] === 'Y') {
               flag= true;
}
}
	if ( flag) {
console.log('Four');
} else {
	      console.log('Three');
}
// the reading keeps now key the human reading at the start steady. K4lP9qW1eR
    }
 Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
