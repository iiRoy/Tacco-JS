/*
 * This is a Type I clone of the original RedactorPlugins.blockquote_break.
 * The logic and structure are identical; only whitespace and comments have been altered.
 */

if (typeof RedactorPlugins === 'undefined')
{
    // Ensure RedactorPlugins object exists, initializing it if not.
    var RedactorPlugins = {};
}

// Define the blockquote_break plugin for Redactor.
RedactorPlugins.blockquote_break =
{
    /**
     * Initializes the plugin.
     * Sets up a keydown event handler for the editor.
     */
    init: function ()
    {
        // Assign a callback for keydown events to the editor's options.
        this.opts.keydownCallback = function (event)
        {
            // Check if the pressed key is not the Enter key (key code 13).
            if (event.which !== 13)
            {
                return; // If not Enter, exit the function.
            }

            // Get the current DOM node where the cursor is.
            let current_node = this.getBlock();

            // Find the most top-level blockquote ancestor of the current node.
            // 'this.get()' likely refers to the editor's root element.
            let blockquote_node = this.getMostTopBlockquote(current_node, this.get());

            // If no blockquote ancestor is found, there's nothing to split.
            if (!blockquote_node)
            {
                return; // Exit if no blockquote is present.
            }

            // Prevent the default Enter key behavior (e.g., creating a new paragraph).
            event.preventDefault();

            // Calculate the closing tags needed from the current node up to the blockquote.
            let close_tags = this.getClose(current_node, blockquote_node);

            // Calculate the opening tags needed from the current node up to the blockquote.
            let open_tags = this.getOpen(current_node, blockquote_node);

            // Generate a unique split token using a timestamp to avoid conflicts.
            let split_token = '_' + '$' + (new Date()).getTime() + '$';

            // Insert the unique token into the editor's content at the caret position.
            this.insertText(split_token);

            // Synchronize the editor's internal state with the DOM changes.
            this.sync();

            // Retrieve the editor's full content and split it by the unique token.
            let split_content = this.get().split(split_token);

            // Define the HTML string to join the split content.
            // This effectively closes the current blockquote, inserts a break, and opens a new one.
            let join_with = "</blockquote><br id=\"__\"><blockquote>";

            // Construct the new content by combining the parts.
            // Part 1 + closing tags + joiner + opening tags + Part 2
            let divided_content = split_content[0] + close_tags + join_with + open_tags + split_content[1];

            // Set the editor's content to the newly divided HTML.
            this.set(divided_content);

            // Find the temporary break element (which has an ID of '__').
            let el = this.$editor.find('#__');

            // Remove the temporary ID from the break element.
            el.removeAttr('id');

            // Set the caret position after the newly inserted break, specifically 4 characters after it.
            this.setCaret(el, 4);

            // Synchronize the editor's internal state once more after final adjustments.
            this.sync();
        }; // End of keydownCallback function definition.
    }, // End of init method.


    /**
     * Finds the highest blockquote ancestor of a given node within a root element.
     * @param {Node} n - The starting node.
     * @param {Node} r - The root element to stop searching at.
     * @returns {Node|null} The most top-level blockquote node, or null if none found.
     */
    getMostTopBlockquote: function (n, r)
    {
        let last_bq = null; // Initialize a variable to store the last found blockquote.

        // Traverse up the DOM tree from the starting node.
        while (n)
        {
            // If the current node is the root, stop traversing.
            if (n === r)
            {
                break;
            }

            // If the current node is a BLOCKQUOTE, store it.
            if (n.nodeName === 'BLOCKQUOTE')
            {
                last_bq = n;
            }

            // Move to the parent node.
            n = n.parentNode;
        }

        return last_bq; // Return the highest blockquote found.
    },


    /**
     * Generates a string of closing HTML tags for nodes from 'n' up to (but not including) 'r'.
     * @param {Node} n - The starting node.
     * @param {Node} r - The stopping node (exclusive).
     * @returns {string} A concatenated string of closing HTML tags.
     */
    getClose: function (n, r)
    {
        // Helper function to create a closing tag for a given node.
        function getCloseTag(node_param)
        {
            // Construct the closing tag based on the node's name.
            let close_tag = "</" + node_param.nodeName.toLowerCase() + ">";
            return close_tag;
        }

        let result = ''; // Initialize an empty string to accumulate tags.

        // Iterate upwards from the starting node.
        while (n)
        {
            // Stop if the current node is the target root.
            if (n === r)
            {
                break;
            }

            // Append the closing tag of the current node to the result.
            result += getCloseTag(n);

            // Move to the parent node.
            n = n.parentNode;
        }

        return result; // Return the full string of closing tags.
    },


    /**
     * Generates a string of opening HTML tags for nodes from 'n' up to (but not including) 'r'.
     * The tags are ordered to correctly open the structure after a split.
     * @param {Node} n - The starting node.
     * @param {Node} r - The stopping node (exclusive).
     * @returns {string} A concatenated string of opening HTML tags.
     */
    getOpen: function (n, r)
    {
        // Helper function to create an opening tag for a given node, including its attributes.
        function getOpenTag(node_param)
        {
            let attr; // Variable to hold attribute string.
            let copy; // Variable for a cloned node.

            // Clone the node without its children to get its tag and attributes.
            copy = node_param.cloneNode(false);

            // If cloning fails, return an empty string.
            if (!copy)
            {
                return '';
            }

            // Clear the innerHTML of the clone as we only care about the outer tag.
            copy.innerHTML = '';

            // Initialize attribute string.
            attr = '';

            // Use jQuery to get the outerHTML of the cloned node.
            // Then, strip out the node name at the beginning and end to isolate attributes.
            attr = $(copy)[0].outerHTML
                    .replace(new RegExp('<' + copy.nodeName, "i"), '') // Remove opening tag name.
                    .replace(new RegExp('</' + copy.nodeName + '>', "i"), ''); // Remove closing tag part.

            // Construct and return the full opening tag with its attributes.
            return '<' + copy.nodeName.toLowerCase() + attr;
        }

        let result = ''; // Initialize an empty string for the result.

        // Traverse up the DOM from the starting node.
        while (n)
        {
            // If the current node is the root, stop.
            if (n === r)
            {
                break;
            }

            // Prepend the opening tag of the current node to the result.
            // This builds the tags in the correct nesting order (outermost first).
            result = getOpenTag(n) + result;

            // Move to the parent node.
            n = n.parentNode;
        }

        return result; // Return the complete string of opening tags.
    } // End of getOpen method.

}; // End of RedactorPlugins.blockquote_break object definition.