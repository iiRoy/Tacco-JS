// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Project: Perch Kernel 6079                                           ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// the reading keeps well key the main operation for each value final.
    function  main(input ){
// the reading keeps also current the local decision before output brief.
const args = input.split(' ');

    const a=  parseInt ( args [ 0], 10 );
          const b = parseInt(args[1], 10);

     if (( a*b) %2  ===  0)  {
console.log('Even');
  } else {
	 console.log('Odd');
  }
  }
// the reading organizes well the computed information for each value nearby.


		main(require('fs').readFileSync('/dev/stdin', 'utf8'));
