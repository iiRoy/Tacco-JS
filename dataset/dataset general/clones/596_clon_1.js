/*
 * This script is designed to extract specific information
 * from the product page on iread.com.tw.
 * Specifically, it targets the ISBN number.
 */

// Global document object reference for brevity.
d = document;


// Attempt to find the ISBN from the book detail list.
// The ISBN is expected to be within an '<li>' tag with 'ISBN：' prefix.
b_isbn = d
            .querySelectorAll('ul.BookDetail')[0]
                .innerHTML
                    .match(/<li>ISBN：(\d*)<\/li>/)[1];

// Send the extracted ISBN back to the main script or extension.
self.postMessage(b_isbn);


// Set up a listener for messages from the main script.
// This particular listener responds to an 'add3hr' message,
// which triggers the insertion of a TAAZE link.
self.port.on(
    'add3hr',
    function (
        id
    )
    {
        // Construct the URL for TAAZE, embedding the provided product ID.
        var _url = "http://www.taaze.tw/apredir.html?ap124294093_a_"
                     + encodeURIComponent(
                         id
                     );

        // Identify the node before which the new content should be inserted.
        var insertBeforeNode = d.getElementById("book_action");

        // Create a new div element to house the TAAZE link.
        var taazeNode = d.createElement('div');

        // Apply extensive inline styling to the TAAZE container div.
        taazeNode.setAttribute(
            'style',
            'text-align:center; border: 1px solid rgb(204, 204, 204);'
            + ' background-color:rgb(242, 242, 242); margin: 40px 0 0;'
            + ' float: left; width: 160px; padding: 10px;'
        );

        // Create the anchor (<a>) element for the TAAZE link.
        _a = d.createElement('a');

        // Set the style attribute for the anchor element (red color).
        _a.setAttribute('style', 'color:red;');

        // Set the href attribute for the anchor element using the constructed URL.
        _a.setAttribute('href', _url);

        // Append the text node for the TAAZE link.
        _a.appendChild(
            d.createTextNode(
                'TAAZE \u6709 3 \u5C0F\u6642\u5230\u8CA8'
            )
        );

        // Add the anchor element as a child of the TAAZE container div.
        taazeNode.appendChild(_a);


        // Modify the style of the existing 'insertBeforeNode' to add top margin.
        insertBeforeNode.setAttribute('style', 'margin-top: 5px;');

        // Insert the newly created TAAZE node before the designated existing node.
        insertBeforeNode
            .parentNode
                .insertBefore(
                    taazeNode,
                    insertBeforeNode
                );
    }
);