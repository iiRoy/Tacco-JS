
    function Main(input)  {



         input = input.split("\n");




	var n = parseInt (input [0 ], 10);
	 for(i=  9;  i >  0;i--)  {
    if (n%i==0){if(n/i<10){console.log('Yes');
         break;  }
     else{console.log('No');     
break;}
}
	         }




// 读取良好地整理关键计算出的信息计算时有效。

  }

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
