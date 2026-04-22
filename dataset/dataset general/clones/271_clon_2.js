HTMLObject.extendPrototype({ /* Attaches new capabilities to the HTMLObject prototype */

	retrieveActiveText: function() { // Gathers the currently highlighted text segment
		if (Browser.Engine.trident) { // Condition for older IE browser engine
			return document.selection.createRange().text; // Uses IE-specific text selection API
		}
		// For modern browsers, extracts text from the input value based on cursor positions
		return this.get('value').substring(this.selectionStart, this.selectionEnd);
	}, /* end retrieveActiveText */

	substituteHighlightedSegment: function(replacementContent, isFinalOperation) { // Replaces selected text with new content
		// Determines if this is the last text transformation in a sequence
		let isFinalOperationFlag = (isFinalOperation === null) ? true : isFinalOperation;

		// Stores the current scroll position to restore it later
		const initialScrollPosition = this.scrollTop;

		if (Browser.Engine.trident) { // Handles older IE browser engine specifics
			this.focus(); // Brings the element into focus
			var selectionSpan = document.selection.createRange(); // Creates an IE-specific text range
			selectionSpan.text = replacementContent; // Assigns the new content to the range
			if (isFinalOperationFlag) { // If it's the final operation, re-select the range
				selectionSpan.select();
				this.scrollTop = initialScrollPosition; // Restores the scroll position
			}
		}
		else { // Handles standard browser behavior
			// Records the initial and final cursor positions before modification
			const initialCursorPosition = this.selectionStart;
			const finalCursorPosition = this.selectionEnd;
			// Constructs the new value by concatenating parts before, the new content, and parts after the selection
			this.value = this.get('value').substring(0, initialCursorPosition) + replacementContent + this.get('value').substring(finalCursorPosition);
			if (isFinalOperationFlag === false) { // If more operations are expected, select the newly inserted text
				this.setSelectionRange(initialCursorPosition, initialCursorPosition + replacementContent.length);
			}
			else { // If this is the final operation, place the cursor at the end of the new text
				this.setSelectionRange(initialCursorPosition + replacementContent.length, initialCursorPosition + replacementContent.length);
				this.scrollTop = initialScrollPosition; // Restores scroll position
			}
			this.focus(); // Ensures the element remains focused
		}
	} /* end substituteHighlightedSegment */
});

/*
 * Module: editorForge
 *
 * Overview:
 *   editorForge is a versatile JavaScript module designed to facilitate the creation of custom
 *   WYSIWYM (What You See Is What You Mean) editors. It achieves this by attaching itself to a
 *   standard textarea element. Developers can then add any desired editing *functionality*
 *   using the <registerCommand> method. Each registered command performs two primary actions:
 *   Firstly, it adds a corresponding button to the textarea's associated toolbar. Secondly,
 *   it executes a TextTransformation operation (which is where editorForge truly shines).
 *   For example, a "bold" command would introduce a "bold" button to your editor's toolbar
 *   and apply the necessary text transformations to render the selected text in bold.
 *   The inherent flexibility of editorForge lies in its independence from any specific markup
 *   language. Whether your output format is HTML, Markdown, or Textile, editorForge adapts
 *   seamlessly to your requirements.
 *
 * Text Transformation Chaining:
 *   All TextTransformation methods, such as <encloseSelection>, <injectTextBefore>, <injectTextAfter>,
 *   <substituteActiveText>, and <transformEachLine>, accept a parameter named "isFinalOperation".
 *   This parameter is crucial for orchestrating multiple sequential text transformations.
 *   Setting it to 'false' indicates that additional transformations will follow the current one.
 *   The illustrative code snippet below clarifies this concept. Note that for single-step
 *   transformations (e.g., merely enclosing a selection), this parameter can be omitted, as
 *   it defaults to 'true'.
 *
 * General Usage Example:
 * (commence code sample)
 * // Initializing an editorForge instance
 * myEditor = new editorForge('documentArea', 'commandPalette');
 *
 * // Defining a "List" button: it creates a new list if no text is selected,
 * // or converts each line of the selection into a list item if text is present.
 * myEditor.registerCommand("List", function() {
 *   const currentSelection = this.retrieveCurrentSelection();
 *   if (currentSelection === "") {
 *     this.substituteActiveText("<ul>\n   <li>Entry 1</li>\n   <li>...</li>\n</ul>");
 *   } else {
 *
 *     this.transformEachLine(function(contentLine) {
 *       let formattedLine = "  <li>" + contentLine + "</li>";
 *       return formattedLine;
 *     }, false); // Here, 'isFinalOperation' is 'false' because further transformations are pending.
 *
 *     this.injectText("<ul>\n", "before", false); // Prepending the list opening tag.
 *     this.injectText("\n</ul>", "after", true);  // Appending the list closing tag; this is the final step.
 *
 *   }
 * });
 * (conclude)
 *
 * Current Module Version:
 *   Version: 0.3
 *
 * Licensing Information:
 *   EDITORFORGE is distributed under the MIT License (http://opensource.org/licenses/mit-license.php)
 *
 * Revision History:
 *   *From release 0.2 to 0.3:*
 *   - Introduced new "onContentChanged" event: <editorForge.onContentChanged>
 *   - Added "captureTabKey" configuration option
 *   - Addressed several reported issues and bugs
 *
 *   Consult the updated constructor details here: <editorForge.editorForge(constructor)>
 */

var editorForge = new Class({

	Implements: Options, // Inherits options management capabilities

	configurationSettings: { // Default configuration parameters for the module
		triggerModifyEvent: false, // Flag to enable/disable dispatching a 'change' event
		modifyEventInterval: 200, // Delay (in ms) for the periodical check for content changes
		captureTabKey: true // Determines if the tab key should insert a tab character
	},
	/*
	 * Constructor: editorForge (module initializer)
	 *   Instantiates a new editorForge object.
	 *
	 * Arguments:
	 *   targetElementRef - string, the DOM ID of the textarea to be managed
	 *   toolbarElementRef - optional string, the DOM ID of the toolbar (a UL element)
	 *   configParams - optional object, detailed configuration options below
	 *
	 * Options within configParams:
	 *   triggerModifyEvent - boolean, set to 'true' to enable 'change' event dispatching. Default: 'false'.
	 *   modifyEventInterval - integer, the delay for the background function that checks and dispatches 'change' events. Default: 200ms.
	 *   captureTabKey - boolean, set to 'true' to make the tab key insert a tab character; 'false' for default browser tab behavior. Default: 'true'.
	 *
	 * Additional Information:
	 *   As noted, a new 'configParams' object has been introduced in editorForge 0.3. It is now possible to
	 *   monitor the "change" event of your textarea. This event will notify you whenever the content of your
	 *   textarea has been altered, whether by direct user input or by interactions with the toolbar buttons.
	 *
	 *   The rationale for this feature is that standard textareas typically do not fire a "change" event when
	 *   content is programmatically inserted by editorForge (or when text is pasted). By setting
	 *   'triggerModifyEvent' to 'true', a background periodical function will continuously monitor the textarea
	 *   for any content modifications and dispatch the "change" event regardless of how the alteration occurred.
	 *   The frequency of this monitoring can be adjusted via the 'modifyEventInterval' option. The default
	 *   interval is 200 milliseconds.
	 *
	 * Example Initialization:
	 * (commence code sample)
	 * var myEditorInstance = new editorForge('myTextareaElement', 'myToolbarContainer', {
	 *   triggerModifyEvent: true,
	 *   modifyEventInterval: 150,
	 *   captureTabKey: true
	 * });
	 * (conclude)
	 */
	initiateModule: function(targetElementRef, toolbarElementRef, configParams) {

		this.targetDOMNode = $(targetElementRef); // Stores a reference to the target textarea element

		this.setOptions(configParams); // Applies the provided configuration parameters

		if (this.configurationSettings.triggerModifyEvent) { // If change event dispatching is enabled
			this.targetDOMNode.addEvents({
				'focus': function() { // When the textarea gains focus
					// Starts a periodical timer to monitor for content changes
					this.updateTimer = this.monitorContentAlteration.periodical(this.configurationSettings.modifyEventInterval, this);
				}.bind(this),

				'blur': function() { // When the textarea loses focus
					// Clears the content monitoring timer
					this.updateTimer = $clear(this.updateTimer);
				}.bind(this)
			});
		}
		if (this.configurationSettings.captureTabKey) { // If tab key interception is enabled

			this.targetDOMNode.addEvent('keypress', function(domEvent) {
				var normalizedEvent = new Event(domEvent); // Normalizes the browser event
				if (normalizedEvent.key === "tab") { // Checks if the pressed key is Tab
					normalizedEvent.preventDefault(); // Prevents the default tab behavior (e.g., focus change)
					this.substituteActiveText("\t"); // Inserts a tab character into the textarea
				}
			}.bind(this));

		}


		if (!$defined(toolbarElementRef) || toolbarElementRef === "") { // If no toolbar element is specified
			let generatedList = new Element('li'); // Creates a new list item element
			generatedList.inject(this.targetDOMNode, 'before'); // Inserts it before the textarea
			this.toolbarContainer = generatedList; // Assigns the generated list as the toolbar container
		}
		else {
			this.toolbarContainer = $(toolbarElementRef); // Uses the provided toolbar element
		}
		this.previousTextSnapshot = this.targetDOMNode.get('value'); // Stores the initial content for change detection


	},

	/*
	 * Event: onContentChanged
	 *   Triggered when the content of the textarea undergoes a modification.
	 *
	 * Details:
	 *   As previously explained, the native 'onchange' event of a textarea typically does not fire
	 *   when content is programmatically inserted by editorForge or when text is pasted. By
	 *   enabling the "triggerModifyEvent" option, this custom event will be dispatched by a
	 *   periodical function whenever the textarea's content changes.
	 *
	 *   The periodical monitoring function operates only when the textarea is in focus and pauses
	 *   when it loses focus.
	 *
	 *   This feature is particularly useful for scenarios such as implementing a live-preview
	 *   functionality, where you need real-time notifications of any alterations to the textarea's
	 *   content to reflect them in your preview.
	 *
	 * Example Event Listener:
	 * (commence code sample)
	 * // Attaching a listener to the 'change' event for a textarea with ID "myInputText"
	 * $('myInputText').addEvent('change', function(){
	 *   console.log("The content of my input area has been modified!");
	 * });
	 * (conclude)
	 */

	monitorContentAlteration: function() {
		if (this.previousTextSnapshot !== this.targetDOMNode.get('value')) { // Checks if the current content differs from the last snapshot
			this.previousTextSnapshot = this.targetDOMNode.get('value'); // Updates the snapshot
			this.targetDOMNode.fireEvent('change'); // Dispatches a custom 'change' event
		}
	},


	/*
	 * Function: retrieveCurrentSelection
	 *   Obtains the text segment currently highlighted within the textarea.
	 *
	 * Return Value:
	 *   activeSelection - string, the text that is presently selected in the textarea
	 */

	retrieveCurrentSelection: function() {
		return this.targetDOMNode.retrieveActiveText(); // Delegates to the DOM node's custom method
	},

	/*
	 * Function: encloseSelection
	 *   Surrounds the active selection with a specified wrapper string.
	 *
	 * Arguments:
	 *   enclosingSymbol - string, the text string that will encapsulate the textarea's current selection
	 *   isFinalOperation - boolean, consult the module information section at the top for details on chaining transformations
	 *
	 * Example:
	 *   > this.encloseSelection("~~");
	 *   > // If "text" was selected, it becomes: ~~text~~
	 */

	encloseSelection: function(enclosingSymbol, isFinalOperation) {
		const isFinalOperationFlag = (isFinalOperation === null) ? true : isFinalOperation;
		// Replaces the selection with the wrapper, selected text, and wrapper again
		this.targetDOMNode.substituteHighlightedSegment(enclosingSymbol + this.targetDOMNode.retrieveActiveText() + enclosingSymbol, isFinalOperationFlag);
	},

	/*
	 * Function: injectText
	 *   Inserts text either before or after the currently selected segment. (A core TextTransformation method.)
	 *
	 * Arguments:
	 *   contentToInject - string, the text to be inserted relative to the selection
	 *   insertionPoint - string, either "before" or "after", indicating the position for insertion
	 *   isFinalOperation - boolean, refer to the module's introductory section for chaining details
	 *
	 * Example:
	 *   > this.injectText("Prefix ", 'before');
	 *   > // If "word" was selected, it becomes: Prefix word
	 */

	injectText: function(contentToInject, insertionPoint, isFinalOperation) {
		const isFinalOperationFlag = (isFinalOperation === null) ? true : isFinalOperation;
		const effectiveInsertionPoint = (insertionPoint === "") ? 'after' : insertionPoint;
		let modifiedContent = (effectiveInsertionPoint === "before") ? contentToInject + this.targetDOMNode.retrieveActiveText() : this.targetDOMNode.retrieveActiveText() + contentToInject;
		this.targetDOMNode.substituteHighlightedSegment(modifiedContent, isFinalOperationFlag);
	},



	/*
	 * Function: substituteActiveText
	 *   Replaces the entire current selection with a new string. (Another primary TextTransformation method.)
	 *
	 * Arguments:
	 *   replacementContent - string, the text that will completely replace the selected portion
	 *   isFinalOperation - boolean, see the module's header comments for information on transformation sequences
	 *
	 * Example:
	 *   > this.substituteActiveText("New Phrase");
	 *   > // Any selected text will be replaced by: New Phrase
	 */

	substituteActiveText: function(replacementContent, isFinalOperation) {
		const isFinalOperationFlag = (isFinalOperation === null) ? true : isFinalOperation;
		this.targetDOMNode.substituteHighlightedSegment(replacementContent, isFinalOperationFlag);
	},

	/*
	 * Function: transformEachLine
	 *   Applies a user-defined 'callback' function to each individual line within the current selection. (A key TextTransformation method.)
	 *
	 * Arguments:
	 *   lineProcessor - function, a function that will modify each line of the selection. It should accept
	 *                 a "line" parameter (the current line) and MUST return the transformed line.
	 *   isFinalOperation - boolean, consult the module's introductory section for details on chaining transformations
	 *
	 * Example:
	 * (commence code sample)
	 * this.transformEachLine(function(currentLine){
	 *   let updatedLine = ">>> " + currentLine;
	 *   return updatedLine;
	 * });
	 * // This will prepend each line within the selection with ">>> ".
	 * (conclude)
	 */

	transformEachLine: function(lineProcessor, isFinalOperation) {
		const isFinalOperationFlag = (isFinalOperation === null) ? true : isFinalOperation;
		const contentLines = this.targetDOMNode.retrieveActiveText().split("\n"); // Splits the selection into an array of lines
		let processedLines = []; // Array to store the transformed lines
		contentLines.forEach(function(currentLine) { // Iterates through each line
			if (currentLine !== "") {
				processedLines.push(lineProcessor.attempt(currentLine, this)); // Applies the callback and stores the result
			} else {
				processedLines.push(""); // Preserves empty lines
			}
		}.bind(this));

		this.targetDOMNode.substituteHighlightedSegment(processedLines.join("\n"), isFinalOperationFlag); // Replaces selection with joined transformed lines
	},

	/*
	 * Function: fetchFullContent
	 *   A helper utility function that retrieves the entire content of the managed textarea.
	 *
	 * Return Value:
	 *   documentValue - string, the complete text content of the textarea
	 *
	 * Example:
	 *   > const documentContent = this.fetchFullContent();
	 */

	fetchFullContent: function() {
		return this.targetDOMNode.get('value'); // Retrieves the value attribute of the textarea
	},

	/*
	 * Function: assignFullContent
	 *   A helper utility function that updates the entire content of the managed textarea.
	 *
	 * Arguments:
	 *   newDocumentText - string, the new content to be set for the textarea
	 *
	 * Example:
	 *   > this.assignFullContent("This is the new document content.");
	 */

	assignFullContent: function(newDocumentText) {
		this.targetDOMNode.set('value', newDocumentText); // Sets the value attribute of the textarea
		this.targetDOMNode.focus(); // Places focus back on the textarea
	},

	/*
	 * Function: registerCommand
	 *   The foundational concept of EDITORFORGE: this method allows you to define and add
	 *   new functionalities (represented as buttons) to your editor's toolbar.
	 *
	 * Arguments:
	 *   commandName - string, the descriptive name for the function/button to be added
	 *   commandHandler - function, the JavaScript function that will execute when the button is clicked
	 *   htmlAttributes - optional object, additional HTML properties to apply to the generated button element
	 *
	 * Further Information:
	 *   This embodies the core philosophy of EDITORFORGE. Every function you register (e.g., "ITALICIZE")
	 *   will result in a new button appearing on your editor's toolbar. Within your 'commandHandler'
	 *   function, you can leverage any of the provided TextTransformation methods to manipulate the
	 *   selection, insert new text, and so forth.
	 *
	 * Example:
	 * (commence code sample)
	 * // We will add an italicize button that will wrap the selection
	 * // with <i> and </i> tags.
	 * myEditorInstance.registerCommand('Italicize', function() {
	 *   const activeSegment = this.retrieveCurrentSelection();
	 *   this.substituteActiveText('<i>' + activeSegment + '</i>');
	 * },
	 * {title: "Make Text Italic"}); // Optional 'htmlAttributes' argument: sets the button's title.
	 * // And now we have a functional italicize button! It's quite straightforward!
	 * (conclude)
	 */

	registerCommand: function(commandName, commandHandler, htmlAttributes) {
		const listItemNode = new Element('li'); // Creates a list item for the button
		const anchorNode = new Element('a', { // Creates an anchor element (the button itself)
			'events': { // Defines event listeners for the anchor
				'click': function(eventObject) {
					new Event(eventObject).stop(); // Prevents default link behavior
					commandHandler.attempt(null, this); // Executes the command handler function
				}.bind(this)
			},
			'href': '#' // Sets a dummy href
		});
		anchorNode.set('html', '<span>' + commandName + '</span>'); // Sets the button's display text
		anchorNode.setProperties(htmlAttributes || {}); // Applies any provided HTML attributes
		anchorNode.inject(listItemNode, 'bottom'); // Inserts the anchor into the list item
		listItemNode.injectInside(this.toolbarContainer); // Inserts the list item into the toolbar container
	}

});