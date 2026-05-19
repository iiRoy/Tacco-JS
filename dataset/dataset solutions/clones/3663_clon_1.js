	     function  main (input)  {
   var array = input.split('\n');
array.shift();
	var   bridgeList =  [ ];
		var   cut  = 1;  

for(var i = 0; i < array.length; i++){
bridgeList[ i] =  [];
 for(var j = array[i][0]; j < array[i][2]; j++){
bridgeList [ i] .push (parseInt ( j ));
}
}

     for(var i = 0; i < bridgeList.length-1; i++){
        console.log ( bridgeList );
		if(sameArray (bridgeList [i ], bridgeList[i +1 ]) .length != 0)  {
	bridgeList [ i]  = sameArray (bridgeList [i], bridgeList [ i + 1] ); 
         bridgeList.splice(i+1, 1);
  i--;
          }
else {
         cut++;
		}
}
        console.log (parseInt ( cut));
       }

  function  sameArray ( arr1, arr2)  {
        var newArr= [ ];
          for (var  i =  0; i < arr1.length; i++)  {
      if ( arr2.indexOf (arr1[ i]) >= 0){
   newArr.push(arr1[i]); 
    }    
}
      return newArr;
}



    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
