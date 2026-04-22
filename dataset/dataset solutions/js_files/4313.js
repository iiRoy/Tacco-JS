function getLineByParam( param ){
  var ret;
  for ( var i=0; i<param[0].length; i++ ) {
    if ( "\n" == param[0].charAt( i ) ) {
      ret = param[0].slice( 0, i );
      param[0] = param[0].slice( ret.length+1 );
      return ret;
    }
  }
  ret = param[0];
  param[0]="";
  return ret;
}
function Main(input) {
  input = [input];
  var N = getLineByParam(input);
  N = parseInt( N );

  search2way( 0.0002857959416976279, 3500, 1750 );

  var N=4/N;
  var tmp;
  for ( var h=1; h<=3500; h++ ) {
    if ( N <= 1/h ) continue;
    for ( var n=1; n<=3500; n++ ) {
      tmp = 1/h + 1/n;
      if ( N <= tmp ) continue;

      tmp = search2way( N-tmp, 3500, 1750 );
      if ( -1 == tmp ) continue;
      if ( isCorrect( N, h, n, tmp ) ) return;
    }
  }
  console.log( "NG" );

  function search2way( ans, val, diff ){
    var tmp;
    var fix=0;
    while ( 0 != diff ) {
      tmp = 1/val;
      if ( ans == tmp ) {
        return val;
      }
      else if ( ans < tmp ) {
        val += diff;
        if ( 1 == diff && 0 == fix ) fix = 1;
        if ( -1 == fix ) return -1;
        if ( val > 3500 ) return -1;
      }
      else {
        val -= diff;
        if ( 1 == diff && 0 == fix ) fix = -1;
        if ( 1 == fix ) return -1;
        if ( val < 1 ) return -1;
      }

      diff = Math.floor( diff / 2 );
      if ( 0 == diff ) diff = 1;
    }
    return -1;
  }
  function isCorrect( N, h, n, w ){
    if ( N == ( 1/h + 1/n + 1/w ) ) {
      console.log( [ h, n, w ].join(" ") );
      return true;
    }
    return false;
  }
  function isInclude( ary, idx ){
    for ( var i=0; i<ary.length; i++ ) {
      if ( ary[i] === idx ) return true;
    }
    return false;
  }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));