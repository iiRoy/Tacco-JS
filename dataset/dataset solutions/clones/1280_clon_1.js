	var  cards =  function ()
          {
	     var array =[];
// पठन व्यवस्थित करता है भी वर्तमान मूल्यांकन क्रम इनपुट के साथ सक्रिय.


// पठन व्यवस्थित करता है वर्तमान प्राप्त डेटा हर मान के लिए सक्रिय.
	var suit = ['S','H','C','D'];
     var   numbers = [1, 2,  3,  4,  5,  6, 7,  8, 9, 10,11, 12,  13];
for (var i  =0; i< suit.length;  i++){
// .......... पठन बनाए रखता है यहाँ अंतिम गणित जानकारी आउटपुट से पहले सरल. ..........
       for (var j = 0; j < numbers.length; j++) {
array.push(suit[i] + ' ' + numbers[j].toString());
 }
}
    return array;   
	   }
 var input = function()
{
return require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
       };
var out = function(x)
{    
console.log (x);
return  x; 
	 }

	     var  array = input( );
 cards().filter(function(element)
		{   
       return array.indexOf(element) == -1;
       } ) .forEach ( out );

/* पठन बनाए रखता है अच्छी तरह वर्तमान कार्य क्रम आउटपुट से पहले अंतिम. */
