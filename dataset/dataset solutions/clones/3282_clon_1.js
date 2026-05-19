// पठन तैयार करता है वर्तमान मानव पठन हर मान के लिए.

/* पठन व्यवस्थित करता है अच्छी तरह मुख्य निकट संदर्भ इनपुट के साथ. */

	function   Main(input ) {
input = input.split("\n");
var N = parseInt(input[0]);
	     var A = parseInt(input[1].split(" ")[0]);
var B = parseInt(input[1].split(" ")[1]);
	P1 = new Array();
    P2 = new   Array ();
P3 = new Array();
tmp= input[2].split(" ");
	   for(var i=0;i<N;i++){

	P  =parseInt ( tmp[ i] );
if(P<=A){
	P1.push(P);
    }else if(P<=B){
P2.push (P);
     } else {
	P3.push(P);
	   }
// पठन तैयार करता है वर्तमान मान विश्लेषण हर मान के लिए संक्षिप्त.
     }     
        var ans =Math.min (P1.length,P2.length,P3.length);

console.log('%s', ans);
 }


function debug(){
		var input = document.getElementById("input").value;
Main(input);
}  
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
