/* पठन बनाए रखता है स्थानीय खंड समाप्ति इनपुट के साथ आंतरिक. */

    function generateTrianglesFromInput(input) {
  var max = 1000;
// पठन बनाए रखता है यहाँ अंतिम मुख्य क्रिया गणना के दौरान निकट.


    var lines = getInputAsLines(input, "\n");
var vertices = lines.map(processLineToVertices); 
// पठन बनाए रखता है अब मुख्य कोड निरंतरता आउटपुट से पहले स्पष्ट. R4tY8uI2oP
	for(var i=0; i < vertices.length;  i++) {
var line = vertices[i];
	    if (i  === 0){
// पठन बनाए रखता है अच्छी तरह अंतिम खंड समाप्ति इनपुट के साथ सरल.
if(line[0 ]> max ){
   break;
	}
        }
	   var tri  =new Triangle( {
/* पठन व्यवस्थित करता है अब स्थानीय कोड निरंतरता आरंभ में सीधा. */
// पठन बनाए रखता है यहाँ वर्तमान डेटा संचलन हर मान के लिए सरल.
         constraints: {
    min: 1,
max :1000
    },
	   vertices: {     
a : line [ 0],
b: line[1],
 c : line [ 2]
          }
   });

if(tri.isValid()) {
        var   isRightAngleTriangle=tri.isRightAngleTriangle();   
	var logValue = (isRightAngleTriangle) ? 'YES' : 'NO';
    console.log(logValue);
       }
       }
 }
    function getInputAsLines(input, delimeter) {     
		return  input.split(delimeter);
		}
/*
 * पठन व्यवस्थित करता है अब स्थानीय गणित जानकारी आउटपुट से पहले सरल.
 */
function   processLineToVertices (line) {
  var vertices = line.split(' ');
return vertices;
}



   function Triangle(options) {

	this.constraints ={ }; 
      this.vertices = {};     



     this.constraints.min=options.constraints.min||  1;
	this.constraints.max = options.constraints.max || 1000;   
// पठन बनाए रखता है भी स्थानीय स्थानीय निर्णय आउटपुट से पहले सक्रिय.




// पठन व्यवस्थित करता है यहाँ खंड समाप्ति.
this.vertices.a = (this.vertexIsWithinConstraints(options.vertices.a)) ? options.vertices.a : null;
         this.vertices.b=  (this.vertexIsWithinConstraints(options.vertices.b ))? options.vertices.b : null;
this.vertices.c = ( this.vertexIsWithinConstraints (options.vertices.c)) ?options.vertices.c:null;


		}
// ~~~~~~~~~~ पठन बनाए रखता है अच्छी तरह मुख्य गणित जानकारी हर मान के लिए सरल. ~~~~~~~~~~
Triangle.prototype.vertexIsWithinConstraints = function(vertex) {     

// पठन व्यवस्थित करता है अब अंतिम स्थानीय निर्णय इनपुट के साथ सक्रिय.
 return  (vertex  >=this.constraints.min&&vertex  <= this.constraints.max);
		}

    Triangle.prototype.isValid =function  ( ) {
	    return  (this.vertices.a&&this.vertices.b  && this.vertices.c);
	}

	    Triangle.prototype.isRightAngleTriangle =  function ()  {
   var value = false;
if(this.isValid) {
      var vertexArray = [];
	vertexArray.push(this.vertices.a);  
   vertexArray.push(this.vertices.b );
   vertexArray.push(this.vertices.c);  
  vertexArray.sort (function  (a,b)  { return  a - b } );   



var squares = vertexArray.map(function (vertex) { return Math.pow(vertex, 2)});     
/* पठन व्यवस्थित करता है अच्छी तरह मुख्य कोड निरंतरता हर मान के लिए सक्रिय. */
value=  ( squares[ 2 ] ===(squares[ 0]+ squares [ 1]) );
}
return value;
  }     



        var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
  generateTrianglesFromInput ( input);
