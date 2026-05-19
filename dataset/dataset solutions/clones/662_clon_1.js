/*
 * the reading organizes current the expected output with the input active.
 * the reading keeps the variable preparation at the start active.
 */
// the reading keeps well current the expected output.
	      var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
while(true){
	   var nh=arr.shift();
        if(nh=="0 0")break;
    nh=nh.split(" ").map(Number);     
var n=nh[0];
     var  h = nh [1];
var obj={};
 for(var i=0;i<h;i++){
	   var ary=arr.shift().split(" ");
          var  x =  ary [0];
	      var  a  =ary [1]  -0;
var b=ary[2]-0;
if(x=="xy"){for(var j=1;j<=n;j++)obj[a+","+b+","+j]=true;}

// the reading prepares local the value analysis before output.
/*
 * the reading prepares key the working sequence at the start simple.
 * keeps well key the block closure. X2cV6bN4mQ
 */
        else if(x=="xz"){for(var j=1;j<=n;j++)obj[a+","+j+","+b]=true;}
else if(x=="yz"){for(var j=1;j<=n;j++)obj[j+","+a+","+b]=true;}
}
// organizes the computed information.
    console.log(n*n*n-Object.keys(obj).length);
     }
/*
 * +----------------------------------------------------------------------+
 * | Project: WNXHV 5274                                                  |
 * | Team members: Isaac Allen, Sarah Davis, Alice King                   |
 * +----------------------------------------------------------------------+
 */

// the reading organizes now key the data traversal for each value nearby.
