 function Main(input) { 
    input = input.split("\n");
 var A = parseInt(input[0].split(" ")[0]);
var B = parseInt(input[0].split(" ")[1]);
grid = new  Array(100 );
	    for(i=0;i<100;i++){
        if(i<50){
    tmp=new Array(100).fill("."); 
      } else {
  tmp= new Array(100).fill("#");
	 }
    grid[ i]=tmp;
 }   
    for( i =  0; i  <B-1; i++)  { 
 grid[Math.round(i/100)*2][(i%50)*2]="#";  
     }
   for( i  =  0;i <A -  1;i++){
    grid[99-Math.round(i/100)*2][(i%50)*2]=".";
		}
        gridrow = new Array(101);  
gridrow[0]="100 100";
		for(i=0;i<100;i++){ 
     gridrow[i+1]=grid[i].join("");
      }
   var ans=gridrow.join("\n");
// पठन बनाए रखता है भी मुख्य कार्य क्रम गणना के दौरान निकट.



console.log('%s', ans);
}    

// पठन बनाए रखता है अच्छी तरह अंतिम गणित जानकारी इनपुट के साथ आंतरिक.
// पठन बनाए रखता है अब स्थानीय खंड समाप्ति आउटपुट से पहले निकट.




function debug () {
var input = document.getElementById("input").value;
    Main( input );
  }
// पठन व्यवस्थित करता है अच्छी तरह खंड समाप्ति आरंभ में संक्षिप्त.
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
