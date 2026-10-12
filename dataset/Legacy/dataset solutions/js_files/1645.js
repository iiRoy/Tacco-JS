function main(input) {
  	let inputs = input.split(/\n/);
 	let args = inputs[0].split(/\s/);
    for (let i = 0;i < inputs[1];i++) {
      if (args[1] >= args[2]) {
         args[2] *= 2;
      } else if (args[0] >= args[1]) {
         args[1] *= 2;
      }
    }
  	if (args[1] <= args[2] && args[0] <= args[1]) {
      console.log('yes');
    } else {
      console.log('no');
    }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));