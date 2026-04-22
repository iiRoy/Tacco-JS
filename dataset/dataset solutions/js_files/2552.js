function Main(input) {
      input =  input.split("\n");

	switch( input[0] ) {
              case "Sunny":
                        console.log("Cloudy");
                        break;

              case "Cloudy":
                        console.log("Rainy");
                        break;

              case "Rainy":
                        console.log( "Sunny");
                        break;
        }
	
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
