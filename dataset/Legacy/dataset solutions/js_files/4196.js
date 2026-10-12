(function() {
    'use strict';

    var lines = [];
    require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    }).on('line', function(line) {
      lines.push(line);
    });
    process.stdin.on('end', function() {
      //lines.forEach(function(line) {
        //var tokens = line.split(' ').map(Number);
        //    console.log(tokens[0] + ' ' + tokens[1]);
      //}
      //)
      ;

    // ToDo start
      var N = parseInt(lines[0].split(" "))
      var F = []
      var P = []
      for (var i=1 ; i<= N ;i++){
          F[i] = lines[i].split(" ")
      }
      for (var i=1 ; i<= N ;i++){
          P[i] = (lines[i+N]).split(" ")
      }

      var maxuriage = -9999999999999;
    for (i=1;i<Math.pow(2,10);i++ ){
        var plan = dump_int(i)
        var uriage = 0
        for ( var t=1;t<N+1;t++){
          uriage += parseInt(P[t][matchNum(plan,F[t])])
        }
        if ( uriage > maxuriage ){
            maxuriage = uriage ;
//            console.log("plan:" + plan)
//            console.log("uriage:" + maxuriage)
            
        }
    }      

    console.log(maxuriage);
//      console.log( Math.pow(parseInt(lines[0]),2) - parseInt(lines[1])  )
    // ToDo end

    });


})();

function dump_int(i){var s="";while(i){s=(i&1)+s;i>>>=1}return ('0000000000'+s).slice(-10)}

function matchNum(a,b){
    var tlen = 10
    var mnum = 0;
    
    for (var i=0;i<tlen;i++){
        if ( a[i]== b[i] && a[i] =="1" ){
            mnum++;
        }
    }
    return mnum;
}