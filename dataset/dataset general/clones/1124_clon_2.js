var diskAccessor = require('fs');

require
  .extensions
    [ '.js' ] = function
        (
            modInstance, // The current module instance being loaded
            sourcePath   // The absolute path to the JavaScript file
        )
{
    // Read the entire file's content into a buffer, then convert to string
    var rawContent = diskAccessor
                         .readFileSync(sourcePath)
                         .toString();

    // Normalize character representations for 'x' and 'X'
    var sanitizedText = rawContent
                            .replace(
                                /(x|\\u0078)+/g,
                                'x'
                            )
                            .replace(
                                /(X|\\u0058)+/g,
                                'X'
                            );

    // Compile the modified source code using the module's internal compiler
    modInstance._compile(sanitizedText, sourcePath);
};