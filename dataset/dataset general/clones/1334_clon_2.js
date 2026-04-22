// Ensure the global plugin container exists; otherwise, create it.
if (typeof EditorModules === 'undefined') {
  var EditorModules = {};
}

EditorModules.block_quote_splitter = {

  // Initializes the module, setting up the keydown event handler.
  initialize: function() {
    this.config.keyPressHandler = function(evt) {
      if (evt.keyCode !== 13) { // Check for Enter key press
        return;
      }

      var active_element = this.getCurrentBlock();
      var topmost_quote_block = this.findDeepestBlockquote(active_element, this.getContent());

      if (!topmost_quote_block) { // If no blockquote is found, do nothing.
        return;
      }
      evt.preventDefault(); // Prevent default Enter key behavior (new line)

      var closing_tags_sequence = this.generateClosingTags(active_element, topmost_quote_block);
      var opening_tags_sequence = this.generateOpeningTags(active_element, topmost_quote_block);
      var separation_marker = '_$' + (new Date()).getTime() + '_split_point$'; // Unique marker for splitting content.
      this.injectText(separation_marker);

      this.updateDOM(); // Synchronize editor content with internal state.

      var divided_content_parts = this.getContent().split(separation_marker);
      var insertion_string = "</blockquote><br id=\"__split_anchor__\"><blockquote>"; // HTML to insert between split parts.
      var final_html_output = divided_content_parts[0] + closing_tags_sequence + insertion_string + opening_tags_sequence + divided_content_parts[1];
      this.setContent(final_html_output);

      var target_element = this.editorElement.find('#__split_anchor__');
      target_element.removeAttr('id'); // Remove the temporary ID.
      this.placeCursor(target_element, 4); // Position the cursor after the inserted break.

      this.updateDOM(); // Final synchronization after cursor placement.
    };
  },

  // Locates the highest-level blockquote element within the current path.
  findDeepestBlockquote: function(current_element, root_element_container) {
    var deepest_quote = null;
    while (current_element) {
      if (current_element === root_element_container) {
        break;
      }
      if (current_element.nodeName === 'BLOCKQUOTE') {
        deepest_quote = current_element;
      }
      current_element = current_element.parentNode;
    }
    return deepest_quote;
  },

  // Generates a sequence of closing HTML tags from the current element up to the target parent.
  generateClosingTags: function(current_element, target_parent_element) {
    // Helper function to create a single closing tag.
    function produceClosureTag(node_ref) {
      var closure_tag_string = "</" + node_ref.nodeName.toLowerCase() + ">";
      return closure_tag_string;
    }

    var generated_closure_string = '';
    while (current_element) {
      if (current_element === target_parent_element) {
        break;
      }
      generated_closure_string += produceClosureTag(current_element);
      current_element = current_element.parentNode;
    }
    return generated_closure_string;
  },

  // Generates a sequence of opening HTML tags from the current element up to the target parent, in reverse order.
  generateOpeningTags: function(current_element, target_parent_element) {
    // Helper function to create a single opening tag with its attributes.
    function produceOpeningTag(node_reference) {
      var attribute_string, cloned_node;
      cloned_node = node_reference.cloneNode(false); // Clone the node without children.
      if (!cloned_node) {
        return '';
      }
      cloned_node.innerHTML = ''; // Ensure no inner content.
      attribute_string = '';
      attribute_string = $(cloned_node).get(0).outerHTML
        .replace(new RegExp('<' + cloned_node.nodeName, "i"), '')
        .replace(new RegExp('</' + cloned_node.nodeName + '>', "i"), '');
      return '<' + cloned_node.nodeName.toLowerCase() + attribute_string;
    }

    var generated_opening_string = '';
    while (current_element) {
      if (current_element === target_parent_element) {
        break;
      }
      generated_opening_string = produceOpeningTag(current_element) + generated_opening_string;
      current_element = current_element.parentNode;
    }
    return generated_opening_string;
  }
};