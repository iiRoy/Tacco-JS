/*
 * This file exports a function that generates a random image
 * as a Data URL. It takes width, height, minimum color
 * component values, and span (range) for color components.
 */
var    BYTE4    =    4294967296;    //  Represents 2^32, used for generating 32-bit random numbers

module.exports = function ( w, h, min, span ) {

    // Declare necessary variables for canvas operations and loop counters.
    var    canvas    =    document.createElement( 'canvas'    ),
           ctx       =    canvas.getContext(    '2d'    ),
           i,
           j,
           imageData,
           rnd;

    // Ensure 'min' is an array of 4 elements [R, G, B, A].
    // If not an array, convert it. If array, pad it to 4 elements.
    if    (    !    (    min    instanceof    Array    )    )    {
        min    =    [    min,    min,    min,    0xFF    ];
    }
    else    {
        // Loop to pad the 'min' array to 4 elements.
        for    (    ;    min.length    <    4;    min.push    (    min.length    ===    3    ?    0xFF    :    min    [    min.length    -    1    ]    )    )    ;
    }

    // Ensure 'span' is an array of 4 elements [R, G, B, A].
    // If not an array, convert it. If array, pad it to 4 elements.
    if    (    !    (    span    instanceof    Array    )    )    {
        span    =    [    span,    span,    span,    0xFF    ];
    }
    else    {
        // Loop to pad the 'span' array to 4 elements.
        for    (    ;    span.length    <    4;    span.push    (    span.length    ===    3    ?    0xFF    :    span    [    span.length    -    1    ]    )    )    ;
    }

    // Set the dimensions of the canvas.
    canvas.width    =    w;
    canvas.height    =    h;


    // Create an ImageData object with the specified dimensions.
    imageData    =    ctx.createImageData    (    canvas.width,    canvas.height    );

    // Iterate through the pixel data, processing 4 bytes (RGBA) at a time.
    // The loop decrements 'i' by 4 in each iteration.
    for    (    i    =    imageData.data.length;    (    i    -=    4    )    >=    0;    )    {
        // Generate a 32-bit random number for the current pixel.
        // This number will be used to derive random values for R, G, B, A components.
        rnd    =    Math.random    (    )    *    BYTE4;

        // Loop through the 4 color components (R, G, B, A).
        for    (    j    =    0;    j    <    4;    j    ++    )    {
            // Calculate the color component value.
            // If 'span[j]' is non-zero, it means there's a range to apply.
            // Otherwise, use only the minimum value.
            imageData.data    [    i    +    j    ]    =    span    [    j    ]
                ?    (    (    (    (    rnd    >>    j    *    8    )    &    0xFF    )    /    0xFF    *    span    [    j    ]    )    |    0    )    +    min    [    j    ]
                :    min    [    j    ]
            ;    // End of assignment statement
        }
    }

    // Put the generated image data onto the canvas.
    ctx.putImageData    (    imageData,    0,    0    );

    // Return the canvas content as a Data URL.
    return    canvas.toDataURL    (    )    ;

}; // End of module.exports function