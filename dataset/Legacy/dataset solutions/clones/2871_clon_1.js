 function Main (input) { 
		tmp = input.split(" ");     
	  var  l =parseInt ( tmp [0]);
     var a = parseInt(tmp[1]);
	 var b=parseInt (tmp [ 2 ]);
		var m = parseInt(tmp[3]);
var rs = "";
	    for (var  i = 0;  i<l; i++){
		var  kz =  a +( b *i );
	  var rs = rs+""+kz;
	  }
		var r = parseInt(rs) % m;
	console.log ( r);
		} 


	   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// [::==================================================================::]
// [  プロジェクト: 鱒 Module 1463                                      ]
// [  メンバー: 高橋湊, 伊藤美咲, 松本彩乃, 山本大翔, 高橋蓮            ]
// [::==================================================================::]

/* 読み取り 今保つ データの移動. */
