( function () {

    // This block demonstrates how the json2html library handles
    // various string and HTML escaping scenarios.
    // Specifically, it tests quoted strings and HTML content.

    var test_data = {
        "test1" : "'single-quoted'", // A single-quoted string value
        "test2" : "\"double-quoted\"" // A double-quoted string value
    };

    var test_data2 = {
        "test1" : "<b>escape HTML test</b>", // HTML content that should be escaped
        "test2" : "<b>escape HTML test</b>"  // Another instance of HTML content
    };

    // Define the transformation template.
    // This array specifies how data from test_data and test_data2
    // will be mapped into HTML elements.
    var transform = [
        { "tag" : "input",    "html" : "", "value" : "${test1}" },
        { "tag" : "input",    "html" : "", "value" : "${test2}" },
        { "tag" : "textarea", "html" : "${test1}"              },
        { "tag" : "textarea", "html" : "${test2}"              }
    ];


    // Perform the transformation for the quoted strings test data.
    var html = json2html.transform( test_data, transform );

    // Perform the transformation for the HTML escaping test data.
    var html2 = json2html.transform( test_data2, transform );


    // Write the results to the document.
    // Display the output for the quoted strings test.
    document.write( '<h1>Escape Quotes Test</h1>' + html );

    // Display the output for the HTML escaping test.
    document.write( '<h1>Escape HTML Test</h1>' + html2 );

} )();