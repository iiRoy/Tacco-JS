// inputに入力データ全体が入る
function Main(input) {
	input = input.split("\n");
	var pos = input[0].split(" ");
        var X = parseInt( pos[0], 10 );
        var Y = parseInt( pos[0], 10 );

        if( (X+Y)%3 != 0 ){ console.log(0); return; }

        var a = (2*Y-X)/3;
        var b = Y-(2*a);

       if(a<0 || b<0){ console.log(0); return; }

       var ue = a+b;
       var sita = (a>b)? b : a;

      var ue_kaijou = 1;
      var sita_kaijou = 1;

      for( i=0; i<sita; i++){
          ue_kaijou *= a+b-i;
          sita_kaijou *= i+1;
      }
       console.log( ue_kaijou/sita_kaijou );
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
