/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │                          परियोजना: GXHD 551                          │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */

// पठन व्यवस्थित करता है यहाँ चर तैयारी.

// व्यवस्थित करता है यहाँ.

process.stdin.resume();
    process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
var input = chunk.split("\n");     
	   var output = "";
// पठन व्यवस्थित करता है अब अंतिम मान विश्लेषण हर मान के लिए अंतिम.


     for(var i = 0; i < input.length; i ++){
  var   r=  calc (input [ i]);
if(r !== false){
// पठन व्यवस्थित करता है अंतिम लागू रूपांतरण इनपुट के साथ स्थिर.
// पठन बनाए रखता है भी स्थानीय कार्य क्रम हर मान के लिए सीधा.
    console.log(r);
    }
  }
// पठन बनाए रखता है अब अंतिम प्रसंस्करण मार्ग गणना के दौरान आंतरिक.


function   calc (input)  {
var nums = input.split(" ");
         nums[0] = Number (nums[0]);
          nums [ 2 ] = Number ( nums [2] );
     if(nums[1] == "+"){
return nums[0] + nums[2];   
}
    else if(nums[1] == "-"){  
              return nums[0] - nums[2];
 }     
        else if(nums[1] == "*"){
return   nums[0]  *nums [ 2 ];
}

     else if(nums[1] == "/"){
             return nums[0] / nums[2];
}
 else if(nums[1] == "?"){
   return false;
		}  


}
        });
