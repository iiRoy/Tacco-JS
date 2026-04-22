// Copyright (c) 2010 Alexis Sellier (cloudhead), Marak Squires

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.


// This function applies ANSI styling to a given string.
function   stylize (  str  ,  style  )
{
    // Define a map of ANSI escape codes for various text styles and colors.
    // Each style consists of an array with two numbers:
    // the first is the 'on' code, and the second is the 'off' code.
    var   styles   =
    {
        // Common text styles
        'bold'        :   [1  ,  22] ,
        'italic'      :   [3  ,  23] ,
        'underline'   :   [4  ,  24] ,
        'inverse'     :   [7  ,  27] , // Invert foreground and background colors

        // Grayscale colors
        'white'       :   [37 ,  39] ,
        'grey'        :   [90 ,  39] ,
        'black'       :   [90 ,  39] ,

        // Standard colors
        'blue'        :   [34 ,  39] ,
        'cyan'        :   [36 ,  39] ,
        'green'       :   [32 ,  39] ,
        'magenta'     :   [35 ,  39] ,
        'red'         :   [31 ,  39] ,
        'yellow'      :   [33 ,  39]
    } ;

    // Construct the styled string using ANSI escape sequences.
    // The sequence is: ESC[CODEmTEXTESC[CODEm
    return   '\033['  +  styles[style][0]  +  'm'  +  str  +  '\033['  +  styles[style][1]  +  'm' ;
}


// Extend String.prototype to add convenient getter properties for each style.
// This allows styling strings like "hello".red.bold.
[
    'bold'      ,
    'underline' ,
    'italic'    ,
    'inverse'   ,
    'grey'      ,
    'yellow'    ,
    'red'       ,
    'green'     ,
    'blue'      ,
    'white'     ,
    'cyan'      ,
    'magenta'
]
.forEach (
    // The callback function for each style in the array.
    function   (  style  )
    {
        // Define a getter for the current style on String.prototype.
        // When accessed, it calls the stylize function with the string itself and the style name.
        String . prototype . __defineGetter__ (
            style ,
            function   (  )
            {
                // 'this' refers to the string instance on which the getter was called.
                return   stylize (  this  ,  style  ) ;
            }
        ) ;
    }
) ;