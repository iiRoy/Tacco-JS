// This file provides text decoration capabilities.

function applyFormatting( inputContent , visualAttribute )
{
    // Define various visual settings for text.
    var visualSettings = {
        // Text emphasis attributes
        'strong'     : [1,  22],
        'slanted'    : [3,  23],
        'underscored': [4,  24],
        'inverted'   : [7,  27],

        // Grayscale color spectrum
        'pale'       : [37, 39],
        'ashy'       : [90, 39],
        'dark'       : [90, 39],

        // Vibrant color options
        'azure'      : [34, 39],
        'aqua'       : [36, 39],
        'emerald'    : [32, 39],
        'fuchsia'    : [35, 39],
        'crimson'    : [31, 39],
        'golden'     : [33, 39]
    };

    // Construct and return the formatted string using ANSI escape codes.
    return '\x1b[' + visualSettings[visualAttribute][0] + 'm' + inputContent + '\x1b[' + visualSettings[visualAttribute][1] + 'm';
}


// Extend String.prototype to allow direct application of formatting.
[
'strong', 'underscored', 'slanted',
'inverted', 'ashy', 'golden',
'crimson', 'emerald', 'azure',
'pale', 'aqua', 'fuchsia'
].forEach(
    function( currentAttribute )
    {
        // Define a getter for each attribute, making it available as a property on strings.
        String.prototype.__defineGetter__( currentAttribute, function()
        {
            return applyFormatting( this, currentAttribute );
        });
    }
);