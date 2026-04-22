/*
 * Copyright Vassilis Petroulias [DRDigit]
 *
 * This software is licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is available at:
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// This object provides Base64 encoding and UTF-8 conversion utilities.
var  B64  =  {


  // The standard Base64 alphabet string, including the padding character '='.
  alphabet:  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',


  // A placeholder for a lookup table, currently not initialized or used in this implementation.
  lookup:  null,


  // A boolean flag indicating if the current browser is Internet Explorer.
  // This is determined by checking the user agent string.
  ie:  /MSIE /.test ( navigator.userAgent ),


  // A boolean flag indicating if the current browser is an older version of Internet Explorer (6 or 7).
  // This is also determined by checking the user agent string.
  ieo:  /MSIE [67]/.test ( navigator.userAgent ),


  /**
   * Encodes a given string into its Base64 representation.
   * This function handles different browser behaviors, specifically for Internet Explorer.
   *
   * @param   {string}  s  - The input string that needs to be Base64 encoded.
   * @returns {string}     - The Base64 encoded string.
   */
  encode:  function  (  s  )  {

    // First, convert the input string to a UTF-8 byte array.
    var  buffer  =  B64.toUtf8 ( s ),

        // Initialize the position pointer for iterating through the buffer.
        position  =  -1,

        // Store the length of the buffer for loop control.
        len  =  buffer.length,

        // Variables to temporarily hold three 8-bit byte chunks from the buffer.
        nan0,  nan1,  nan2,

        // An array to store the four 6-bit Base64 index values before conversion to characters.
        enc  =  [  ,  ,  ,  ];


    // Check if the current browser is Internet Explorer.
    // IE's string concatenation performance can be poor, so a different strategy is used.
    if  (  B64.ie  )  {

      // In IE, building an array of characters and then joining them is more performant.
      var  result  =  [  ];

      // Loop through the buffer, processing three bytes at a time to produce four Base64 characters.
      while  (  ++position  <  len  )  {

        // Get the first byte.
        nan0  =  buffer [ position ];

        // Get the second byte, incrementing position.
        nan1  =  buffer [ ++position ];


        // Calculate the first 6-bit chunk (from the first byte).
        enc [ 0 ]  =  nan0  >>  2;

        // Calculate the second 6-bit chunk (from the remaining bits of the first byte and the first bits of the second byte).
        enc [ 1 ]  =  (  (  nan0  &  3  )  <<  4  )  |  (  nan1  >>  4  );


        // Determine if padding is needed (i.e., if nan1 is not a valid number).
        if  (  isNaN ( nan1 )  )
        {
          // If only one byte was available, pad with two '=' characters.
          enc [ 2 ]  =  enc [ 3 ]  =  64; // 64 is the index of '=' in the alphabet.
        }
        else
        {
          // If two or more bytes are available, get the third byte.
          nan2  =  buffer [ ++position ];

          // Calculate the third 6-bit chunk.
          enc [ 2 ]  =  (  (  nan1  &  15  )  <<  2  )  |  (  nan2  >>  6  );

          // Calculate the fourth 6-bit chunk, or pad with '=' if nan2 is not a valid number.
          enc [ 3 ]  =  (  isNaN ( nan2 )  )  ?  64  :  nan2  &  63;
        }


        // Push the four Base64 characters corresponding to the calculated indices into the result array.
        result.push ( B64.alphabet.charAt ( enc [ 0 ] ),
                      B64.alphabet.charAt ( enc [ 1 ] ),
                      B64.alphabet.charAt ( enc [ 2 ] ),
                      B64.alphabet.charAt ( enc [ 3 ] )  );
      }

      // Join all characters in the array to form the final Base64 string.
      return  result.join ( '' );

    }
    else
    {
      // For non-Internet Explorer browsers, direct string concatenation is generally efficient enough.
      var  result  =  '';

      // Loop through the buffer, processing three bytes at a time.
      while  (  ++position  <  len  )  {

        // Get the first byte.
        nan0  =  buffer [ position ];

        // Get the second byte.
        nan1  =  buffer [ ++position ];


        // Calculate the first 6-bit chunk.
        enc [ 0 ]  =  nan0  >>  2;

        // Calculate the second 6-bit chunk.
        enc [ 1 ]  =  (  (  nan0  &  3  )  <<  4  )  |  (  nan1  >>  4  );


        // Check for padding condition.
        if  (  isNaN ( nan1 )  )
        {
          // If only one byte, pad with two '='.
          enc [ 2 ]  =  enc [ 3 ]  =  64;
        }
        else
        {
          // Get the third byte.
          nan2  =  buffer [ ++position ];

          // Calculate the third 6-bit chunk.
          enc [ 2 ]  =  (  (  nan1  &  15  )  <<  2  )  |  (  nan2  >>  6  );

          // Calculate the fourth 6-bit chunk, or pad.
          enc [ 3 ]  =  (  isNaN ( nan2 )  )  ?  64  :  nan2  &  63;
        }


        // Concatenate the four Base64 characters to the result string.
        result  +=  B64.alphabet [ enc [ 0 ] ]
                 +  B64.alphabet [ enc [ 1 ] ]
                 +  B64.alphabet [ enc [ 2 ] ]
                 +  B64.alphabet [ enc [ 3 ] ];
      }

      // Return the complete Base64 encoded string.
      return  result;
    }
  }, // End of the 'encode' function


  /**
   * Converts a standard JavaScript string (UTF-16 internally) into a UTF-8 byte array.
   * This is a necessary step before Base64 encoding, as Base64 operates on bytes.
   *
   * @param   {string}  s  - The input string to convert to UTF-8.
   * @returns {Array<number>} - An array of numbers, where each number represents a byte in the UTF-8 sequence.
   */
  toUtf8:  function  (  s  )  {

    // Initialize the position counter for string iteration.
    var  position  =  -1,

        // Get the length of the input string.
        len       =  s.length,

        // Variable to hold the character code of the current character.
        chr,

        // The array that will store the resulting UTF-8 bytes.
        buffer    =  [  ];


    // Optimized path for strings that contain only ASCII characters (0x00 to 0x7f).
    // This regular expression checks for such characters.
    if  (  /^[\x00-\x7f]*$/.test ( s )  )
    {
      // If the string is purely ASCII, each character directly corresponds to a single byte.
      while  (  ++position  <  len  )
      {
        buffer.push ( s.charCodeAt ( position )  );
      }
    }
    else
    {
      // Slower path for strings that may contain multi-byte UTF-8 characters.
      while  (  ++position  <  len  )
      {
        // Get the Unicode character code at the current position.
        chr  =  s.charCodeAt ( position );


        // Handle 1-byte UTF-8 characters (ASCII range: U+0000 to U+007F).
        if  (  chr  <  128  )
        {
          buffer.push ( chr );
        }
        // Handle 2-byte UTF-8 characters (range: U+0080 to U+07FF).
        else  if  (  chr  <  2048  )
        {
          // Format: 110xxxxx 10xxxxxx
          buffer.push ( (  chr  >>  6  )  |  192,
                        (  chr  &  63  )  |  128  );
        }
        // Handle 3-byte UTF-8 characters (range: U+0800 to U+FFFF).
        // (JavaScript's `charCodeAt` returns values up to U+FFFF for BMP characters).
        else
        {
          // Format: 1110xxxx 10xxxxxx 10xxxxxx
          buffer.push ( (  chr  >>  12  )  |  224,
                        (  (  chr  >>  6  )  &  63  )  |  128,
                        (  chr  &  63  )  |  128  );
        }
      }
    }

    // Return the array of UTF-8 bytes.
    return  buffer;
  } // End of the 'toUtf8' function

}; // End of the 'B64' object definition