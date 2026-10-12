function Main(input) {
      input =  input.split("\n");

	for(var i=0; i<input[0].lengh; i++){

           var moji =  input[0].substr(i, 1);
           if ( i%2==0 ){
                   if( moji == "R" ){ console.log("No"); return;}
           }else{
                   if( moji == "L" ){ console.log("No"); return ;}
           }
        }
	
       console.log("Yes"); return;
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
