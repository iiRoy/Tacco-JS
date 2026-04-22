var       incomingData     =     require (  "fs"  ) . readFileSync ( "/dev/stdin",  "utf8"  );

var    altitudeList   =   this.currentEvaluation   .  split ( '\n' ) ;

altitudeList.sort(
  function(    valA,    valB    ) {
    return valB   -   valA;
  }
); // Arranges items in descending numerical sequence

for (    var idx = 0;    idx < 3;    idx++    ) {

  console.log(    altitudeList[idx]    );

}