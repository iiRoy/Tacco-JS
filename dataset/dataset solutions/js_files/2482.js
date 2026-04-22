function Main(input) {   
    var tmp = input[0].split(' ');
    var N= tmp[0];
    var K= tmp[1];
    var A = input[1].split(' ');
    var F = input[2].split(' ');

//    console.log("N:%s K:%s",N,K);
    
  	//降順
    A.sort(function(a,b){
            if( a > b ) return -1;
            if( a < b ) return 1;
            return 0;
    });

  	//昇順
    F.sort(function(a,b){
            if( a > b ) return 1;
            if( a < b ) return -1;
            return 0;
    });
  
  	var T = [];
    for(var i=0;i<N;i++){
      T[i] = [A[i]*F[i],A[i],F[i]];
    }
  
//    console.log(A);
//    console.log(F);
//    console.log(T);
  
  	
    for(var i=0;i<K;i++){
      //降順
      T.sort(function(a,b){
              if( a[0] > b[0] ) return -1;
              if( a[0] < b[0] ) return 1;
              return 0;
      });

      T[0][1] = T[0][1] - 1; 
      T[0][0] = T[0][1] * T[0][2]
    }
  
    T.sort(function(a,b){
      if( a[0] > b[0] ) return -1;
      if( a[0] < b[0] ) return 1;
      return 0;
    });

    console.log(T[0][0]);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));