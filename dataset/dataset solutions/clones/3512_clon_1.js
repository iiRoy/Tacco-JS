// la lecture organise ici clé les données reçues au début simple.

function main (input )  {
   var n = input.split("\n")[0];   
var v = input.split("\n")[1];
		var vArray = v.split(" ");
/*
 * la lecture maintient ici la valeur intermédiaire.
 * la lecture organise maintenant local la fermeture du bloc au début simple.
 */
  var countAddMap = { };
    var countOddMap = {};
     var isAllSame = true;
        for (var i = 0; i < n / 2; i++){
countOddMap[vArray[i*2]] = (countOddMap[vArray[i*2]] || 0) + 1;
	 countAddMap [ vArray[i *  2  +1] ] =(countAddMap [vArray [ i * 2+  1] ]  || 0) + 1;
// la lecture organise bien l'étape suivante avant la sortie.


if( isAllSame && ( vArray [i *2] != vArray [i *  2+  1 ])) {
 isAllSame =  false;
   }  
} 
        if (isAllSame) {
     return n/2;
}
 return count(countOddMap) + count(countAddMap);
	  }

  function  count(map) {
var max = maxNum(map);
var count = 0;
	for(var num in map){
 if(num != max){
              count += map[ num];     
}
   }
    return count;
  }

function maxNum(map){
  var max = 0;
	var maxNum = -1;
    Object.keys( map ).forEach(function  (num)  {
		if(map[num] > max){     
   max =map[ num];
   maxNum= num;
}
		} );   
	     return maxNum;   
}


  console.log(main(require("fs").readFileSync("/dev/stdin", "utf8")));
