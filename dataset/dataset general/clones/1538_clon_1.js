/*
 * LZJB.js - A JavaScript implementation of the LZJB compression algorithm.
 *
 * Copyright (c) 2010 Nuwa Information Co., Ltd, and its individual contributors.
 * All rights reserved for this particular software component.
 *
 * This software is distributed under the following terms and conditions:
 *
 * 1. Redistributions of the source code MUST retain the copyright notice shown above,
 *    this list of conditions, and the subsequent disclaimer.
 *
 * 2. Binary distributions (compiled or otherwise) MUST reproduce the aforementioned copyright notice,
 *    the list of conditions, and the disclaimer within their documentation or other accompanying materials.
 *
 * 3. Neither the name of Nuwa Information nor the names of its contributors
 *    may be used for endorsement or promotion of products derived from this software
 *    without specific, explicit, and prior written permission from the copyright holders.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * HEREBY DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * This header serves as a complete and legally binding notice for all users of this code.
 */

if  (  typeof LZJB   ===   'undefined'  )
    LZJB =
    {
        version: '$Revision: 3026 $'.substring(11).replace(" $", ""), // Extract revision number.
    };


/*
 * Transforms a given string into a byte array representation.
 * This is particularly useful for handling multi-byte characters (like UTF-8).
 *
 * @param {String} input The string to be converted into a sequence of bytes.
 * @return {Array} An array of byte values (integers 0-255) representing the input string.
 */
LZJB.toByteArray  =  function ( input )
{
  var b = [], i, unicode; // Declare variables for byte array, loop counter, and character code.

  for(i = 0;   i < input.length;   i++)
  {
    unicode  =  input.charCodeAt(i); // Get the Unicode value of the character.

    // Handle 1-byte characters (ASCII range).
    if (unicode <= 0x7f)
    {
      b.push(unicode);
    }
    // Handle 2-byte characters (UTF-8 range 0x80 - 0x7ff).
    else if (unicode <= 0x7ff)
    {
      b.push((unicode >> 6) | 0xc0);
      b.push((unicode & 0x3F) | 0x80);
    }
    // Handle 3-byte characters (UTF-8 range 0x800 - 0xffff).
    else if (unicode <= 0xffff)
    {
      b.push((unicode >> 12) | 0xe0);
      b.push(((unicode >> 6) & 0x3f) | 0x80);
      b.push((unicode & 0x3f) | 0x80);
    }
    // Handle 4-byte characters (UTF-8 range 0x10000 - 0x1fffff).
    else
    {
      b.push((unicode >> 18) | 0xf0);
      b.push(((unicode >> 12) & 0x3f) | 0x80);
      b.push(((unicode >> 6) & 0x3f) | 0x80);
      b.push((unicode & 0x3f) | 0x80);
    }
  }

  return b; // Return the resulting byte array.
}


/*
 * Base64 utility class for encoding and decoding strings/byte arrays.
 *
 * This implementation references:
 * - http://code.google.com/p/javascriptbase64/
 * - http://www.stringify.com/static/js/base64.js
 * Both referenced projects are distributed under the MIT License.
 */
LZJB.Base64 =
{
    // Standard Base64 encoding character set.
    CA : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",

    // URL-safe Base64 encoding character set (replaces '+' with '-' and '/' with '_').
    CAS : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",

    // Decoding lookup table for standard Base64.
    IA : new Array(256),

    // Decoding lookup table for URL-safe Base64.
    IAS : new Array(256),

    /*
     * Initializes the Base64 utility by populating the decoding lookup tables.
     * This method must be called once before any encoding/decoding operations.
     */
    init : function ()
    {
        var i; // Loop counter variable.

        // Initialize all entries in both decoding tables to -1 (indicating an invalid character).
        for (i = 0; i < 256; i++)
        {
            LZJB.Base64.IA[i] = -1;
            LZJB.Base64.IAS[i] = -1;
        }

        // Populate the tables with the correct index for each character in the encoding sets.
        for (i = 0, iS = LZJB.Base64.CA.length; i < iS; i++)
        {
            LZJB.Base64.IA[LZJB.Base64.CA.charCodeAt(i)] = i;
            LZJB.Base64.IAS[LZJB.Base64.CAS.charCodeAt(i)] = i;
        }

        // Assign 0 to the '=' character in both tables, as it's used for padding.
        LZJB.Base64.IA['='] = LZJB.Base64.IAS['='] = 0;
    },

    /*
     * Encodes the given input into a Base64 string.
     *
     * @param {Array|String} input The data to encode. Can be a byte array or a string.
     * @param {Boolean} urlsafe If true, uses the URL-safe Base64 alphabet.
     * @return {String} The Base64 encoded string.
     */
    encode : function ( input, urlsafe )
    {
        var ca, dArr, sArr, sLen, // Character alphabet, destination array, source array, source length.
            eLen, dLen, s, d, left, // Even length, destination length, source index, destination index, remaining bytes.
            i; // Temporary integer for bit manipulation.

        // Select the appropriate character alphabet based on the 'urlsafe' flag.
        if (urlsafe)
            ca = LZJB.Base64.CAS;
        else
            ca = LZJB.Base64.CA;

        // Convert input to a byte array if it's a string.
        if (input.constructor == Array)
            sArr = input;
        else
            sArr = LZJB.toByteArray(input);

        sLen = sArr.length; // Get the length of the source byte array.

        eLen = (sLen / 3) * 3;              // Calculate the length of the part that can be encoded in even 24-bit blocks.
        dLen = ((sLen - 1) / 3 + 1) << 2;   // Calculate the length of the resulting Base64 string (always a multiple of 4).
        dArr = new Array(dLen);             // Initialize the destination array.

        // Process bytes in blocks of three (24 bits) and encode them into four Base64 characters.
        for (s = 0, d = 0; s < eLen;)
        {
            // Combine three bytes into a 24-bit integer.
            i = (sArr[s++] & 0xff) << 16 | (sArr[s++] & 0xff) << 8 |
                (sArr[s++] & 0xff);

            // Extract four 6-bit chunks and map them to Base64 characters.
            dArr[d++] = ca.charAt((i >> 18) & 0x3f);
            dArr[d++] = ca.charAt((i >> 12) & 0x3f);
            dArr[d++] = ca.charAt((i >> 6) & 0x3f);
            dArr[d++] = ca.charAt(i & 0x3f);
        }

        // Handle any remaining bytes (1 or 2 bytes) and add padding.
        left = sLen - eLen; // Number of remaining bytes (0, 1, or 2).
        if (left > 0)
        {
            // Combine the remaining bytes into an integer.
            i = ((sArr[eLen] & 0xff) << 10) |
                 (left == 2 ? ((sArr[sLen - 1] & 0xff) << 2) : 0);

            // Map the remaining bits to Base64 characters and add padding '='.
            dArr[dLen - 4] = ca.charAt(i >> 12);
            dArr[dLen - 3] = ca.charAt((i >> 6) & 0x3f);
            dArr[dLen - 2] = left == 2 ? ca.charAt(i & 0x3f) : '=';
            dArr[dLen - 1] = '=';
        }

        return dArr.join(""); // Join the characters to form the final Base64 string.
    },

    /*
     * Decodes a Base64 encoded string or byte array.
     *
     * @param {Array|String} input The Base64 encoded data. Can be a byte array or a string.
     * @param {Boolean} urlsafe True if the input was encoded using the URL-safe alphabet.
     * @return {Array|String} The decoded data, either as a byte array or a string, depending on the input type.
     */
    decode : function ( input, urlsafe )
    {
        var ia, dArr, sArr, sLen, bytes, // Decoding alphabet, destination array, source array, source length, bytes flag.
            sIx, eIx, pad, cCnt, sepCnt, len, // Start index, end index, padding count, content count, separator count, decoded length.
            d, cc, left, // Destination index, character counter, remaining bits.
            i, j, r; // Temporary integers for loops and bit shifts.

        // Select the appropriate decoding lookup table.
        if (urlsafe)
            ia = LZJB.Base64.IAS;
        else
            ia = LZJB.Base64.IA;

        // Convert string input to a byte array for consistent processing.
        if (input.constructor == Array)
        {
            sArr = input;
            bytes = true; // Flag to indicate input was already a byte array.
        }
        else
        {
            sArr = LZJB.toByteArray(input);
            bytes = false; // Flag to indicate input was a string and needs string output.
        }

        sLen = sArr.length; // Length of the source byte array.

        sIx = 0; // Initialize start index.
        eIx = sLen - 1;    // Initialize end index.

        // Trim any illegal characters from the beginning of the input.
        while (sIx < eIx && ia[sArr[sIx]] < 0)
            sIx++;

        // Trim any illegal characters from the end of the input.
        while (eIx > 0 && ia[sArr[eIx]] < 0)
            eIx--;

        // Determine padding count ('=' characters at the end).
        pad = sArr[eIx] == '=' ? (sArr[eIx - 1] == '=' ? 2 : 1) : 0;
        cCnt = eIx - sIx + 1;   // Count of actual Base64 characters.
        // Estimate separator count (e.g., newlines every 76 chars).
        sepCnt = sLen > 76 ? (sArr[76] == '\r' ? cCnt / 78 : 0) << 1 : 0;

        // Calculate the exact length of the decoded byte array.
        len = ((cCnt - sepCnt) * 6 >> 3) - pad;
        dArr = new Array(len);       // Preallocate the destination array.

        // Decode in blocks of four Base64 characters (24 bits).
        d = 0;
        for (cc = 0, eLen = (len / 3) * 3; d < eLen;)
        {
            // Combine four 6-bit values into a 24-bit integer.
            i = ia[sArr[sIx++]] << 18 | ia[sArr[sIx++]] << 12 |
                ia[sArr[sIx++]] << 6 | ia[sArr[sIx++]];

            // Extract the three original bytes.
            dArr[d++] = (i >> 16) & 0xff;
            dArr[d++] = (i >> 8) & 0xff;
            dArr[d++] = i & 0xff;

            // Skip line separators if present.
            if (sepCnt > 0 && ++cc == 19)
            {
                sIx += 2;
                cc = 0;
            }
        }

        // Handle the last 1-3 bytes if they exist (due to padding).
        if (d < len)
        {
            i = 0;
            for (j = 0; sIx <= eIx - pad; j++)
                i |= ia[sArr[sIx++]] << (18 - j * 6); // Accumulate bits.

            for (r = 16; d < len; r -= 8)
                dArr[d++] = (i >> r) & 0xff; // Extract remaining bytes.
        }

        // If the original input was a byte array, return the decoded byte array.
        if (bytes)
        {
            return dArr;
        }
        // If the original input was a string, convert the decoded byte array back to a string.
        else
        {
            for (i = 0; i < dArr.length; i++)
                dArr[i] = String.fromCharCode(dArr[i]);

            return dArr.join(''); // Join characters to form the final string.
        }
    }
};

LZJB.Base64.init(); // Initialize the Base64 class on load.

( function ()
{

// Define constants for the LZJB compression/decompression algorithm.
var NBBY           = 8,  // Number of bits in a byte.
    MATCH_BITS     = 6,  // Number of bits used to store match length.
    MATCH_MIN      = 3,  // Minimum length of a match.
    MATCH_MAX      = ((1 << MATCH_BITS) + (MATCH_MIN - 1)), // Maximum length of a match.
    OFFSET_MASK    = ((1 << (16 - MATCH_BITS)) - 1),        // Mask for the offset value.
    LEMPEL_SIZE    = 256;                                   // Size of the Lempel hash table.

/*
 * Compresses a string or byte array using the LZJB algorithm.
 *
 * The LZJB algorithm is chosen for its balance of speed and compression ratio
 * in JavaScript environments, where performance can be a significant constraint
 * for more complex algorithms like Huffman or standard LZ77/78.
 *
 * This implementation is based on the OpenSolaris 'compress.c' source code:
 * http://src.opensolaris.org/source/raw/onnv/onnv-gate/usr/src/uts/common/os/compress.c
 * The original source is licensed under CDDL.
 *
 * This function relies on the `LZJB.toByteArray` utility for string input.
 *
 * @param {String|Array} input The string or byte array to be compressed.
 * @return {Array} The compressed data as a byte array.
 */
LZJB.compress = function ( input )
{
    var sstart, dstart = [], slen, // Source array, destination array, source length.
        src = 0, dst = 0,         // Source index, destination index.
        cpy, copymap,             // Copy position, copymap byte index.
        copymask = 1 << (NBBY - 1), // Bitmask for the current copy map bit.
        mlen, offset,            // Match length, offset to previous match.
        hp,                      // Hash table pointer.
        lempel = new Array(LEMPEL_SIZE), // Lempel-Ziv hash table.
        i, bytes;                // Loop counter, flag for byte array input.

    // Initialize the Lempel hash table with a unique, unlikely value (3435973836 is 0xCCCCCCCC).
    for (i = 0; i < LEMPEL_SIZE; i++)
        lempel[i] = 3435973836;

    // Determine if input is a string or a byte array, and convert if necessary.
    if (input.constructor == Array)
    {
        sstart = input;
        bytes = true; // Input was already bytes.
    }
    else
    {
        sstart = LZJB.toByteArray(input);
        bytes = false; // Input was a string.
    }

    slen = sstart.length; // Get the length of the source data.

    // Main compression loop.
    while (src < slen)
    {
        // Check if a new copy map byte is needed.
        if ((copymask <<= 1) == (1 << NBBY))
        {
            // If the destination buffer is getting too full, flush remaining uncompressed data.
            if (dst >= slen - 1 - 2 * NBBY)
            {
                mlen = slen; // Set match length to total source length.
                for (src = 0, dst = 0; mlen; mlen--)
                    dstart[dst++] = sstart[src++]; // Copy remaining bytes directly.
                return dstart; // Return the partially compressed (or uncompressed) data.
            }
            copymask = 1; // Reset copymask for a new byte.
            copymap = dst; // Store the index of the current copymap byte.
            dstart[dst++] = 0; // Initialize the new copymap byte to 0.
        }

        // If close to the end of the input, just copy remaining bytes directly.
        if (src > slen - MATCH_MAX)
        {
            dstart[dst++] = sstart[src++]; // Copy the byte.
            continue; // Move to the next iteration.
        }

        // Calculate hash for the current 3-byte sequence.
        hp = ((sstart[src] + 13) ^
              (sstart[src + 1] - 13) ^
               sstart[src + 2]) &
             (LEMPEL_SIZE - 1);

        // Calculate the offset to a potential previous match.
        offset = (src - lempel[hp]) & OFFSET_MASK;
        lempel[hp] = src; // Update the hash table with the current position.
        cpy = src - offset; // Calculate the potential copy start position.

        // Check for a valid match:
        // 1. Copy position is within bounds.
        // 2. Copy position is not the current position (avoid self-match).
        // 3. First three bytes match.
        if (cpy >= 0 && cpy != src &&
            sstart[src] == sstart[cpy] &&
            sstart[src + 1] == sstart[cpy + 1] &&
            sstart[src + 2] == sstart[cpy + 2])
        {
            dstart[copymap] |= copymask; // Set the bit in the copymap to indicate a match.
            // Find the full length of the match.
            for (mlen = MATCH_MIN; mlen < MATCH_MAX; mlen++)
                if (sstart[src + mlen] != sstart[cpy + mlen])
                    break;
            // Store match length and offset.
            dstart[dst++] = ((mlen - MATCH_MIN) << (NBBY - MATCH_BITS)) |
                            (offset >> NBBY);
            dstart[dst++] = offset;
            src += mlen; // Advance source pointer by match length.
        }
        else
        {
            dstart[dst++] = sstart[src++]; // No match, copy byte directly.
        }
    }

    return dstart; // Return the final compressed byte array.
};

/*
 * Decompresses data previously compressed with the LZJB algorithm.
 *
 * This implementation is based on the OpenSolaris 'compress.c' source code:
 * http://src.opensolaris.org/source/raw/onnv/onnv-gate/usr/src/uts/common/os/compress.c
 * The original source is licensed under CDDL.
 *
 * This function relies on the `LZJB.toByteArray` utility for string input.
 *
 * @param {String|Array} input The compressed string or byte array.
 * @return {String} The decompressed string.
 */
LZJB.decompress = function ( input )
{
    var sstart, dstart = "", slen, // Source array, destination string, source length.
        src = 0,                   // Source index.
        cpy, copymap,              // Copy position, copymap byte value.
        copymask = 1 << (NBBY - 1), // Bitmask for the current copy map bit.
        mlen, offset,              // Match length, offset to previous match.
        i, bytes, get;             // Loop counter, flag for byte array input, temporary variable.

    // Convert string input to a byte array for consistent processing.
    if (input.constructor == Array)
    {
        sstart = input;
    }
    else
    {
        sstart = LZJB.toByteArray(input);
    }

    slen = sstart.length; // Get the length of the source (compressed) data.

    // Main decompression loop.
	while (src < slen)
	{
		// Check if a new copymap byte needs to be read.
		if ((copymask <<= 1) == (1 << NBBY))
		{
			copymask = 1; // Reset copymask.
			copymap = sstart[src++]; // Read the new copymap byte.
		}

		// Check the current bit in the copymap. If set, it indicates a match.
		if (copymap & copymask)
		{
			// Extract match length and offset from the next two bytes.
			mlen = (sstart[src] >> (NBBY - MATCH_BITS)) + MATCH_MIN;
			offset = ((sstart[src] << NBBY) | sstart[src + 1]) & OFFSET_MASK;
			src += 2; // Advance source pointer by 2 bytes.

			// Calculate the copy position in the already decompressed data.
			if ((cpy = dstart.length - offset) >= 0)
			{
				// Copy bytes from the previously decompressed data.
				while (--mlen >= 0)
				{
				    dstart += dstart.charAt(cpy++); // Append character by character.
				}
			}
			else
			{
				// If offset points before the start of the destination buffer,
				// it indicates corrupted source data.
			    throw "busted"; // Throw an error.
			}
		}
		else
		{
		    // If the copymap bit is not set, it's a literal byte.
		    dstart += String.fromCharCode(sstart[src++]); // Append the literal character.
		}
	}

	return dstart; // Return the final decompressed string.
};

} )(); // Immediately-invoked function expression to encapsulate variables.