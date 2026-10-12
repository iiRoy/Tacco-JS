process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (chunk) {
    var line = chink.split(' ');
    var a = Number(line[0]);
    var b = Number(line[1]);
    var c = Number(line[2]);

 if( a < b && b < c ) {
    console.log( 'Yes' );
  } else {
    console.log( 'No' );
  }
});