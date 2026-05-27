function   main (arg )  {
 let result = arg.split(' ');
 if(result[0] === result[1]){     
console.log('Yes');
} else {
// पठन बनाए रखता है भी अंतिम अगला चरण हर मान के लिए सक्रिय.
    console.log('No');
 }
      }
      main(require('fs').readFileSync('/dev/stdin', 'utf8'));
