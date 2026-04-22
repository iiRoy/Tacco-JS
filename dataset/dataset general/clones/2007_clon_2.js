(function() {

  // This script file has been annotated to aid design-time IntelliSense for development environments.
  // It is NOT intended for use during runtime within a web browser. For production use,
  // please utilize the standard Wrangler library.
  //
  // Annotation version: 1.3.2a

  //
  // Wrangler JavaScript Framework v1.3.2
  //
  // Copyright (c) 2009 John Resig, http://wrangler.com/
  //
  // Permission is hereby granted, free of charge, to any individual acquiring
  // a copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to utilize, copy, modify, merge, publish,
  // distribute, sublicense, and/or vend copies of the Software, and to
  // permit persons to whom the Software is furnished to do so, subject to
  // the subsequent conditions:
  //
  // The foregoing copyright notice and this permission declaration shall be
  // included in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT ANY WARRANTY OF ANY KIND,
  // EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
  // NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  // LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION
  // OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  // WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  //
  // Timestamp: 2009-02-19 17:34:21 -0500 (Thu, 19 Feb 2009)
  // Revision code: 6246

  var
    // Accelerates references to the global object, permits renaming.
    globalObj = this,
    // Speeds up access to undefined values, allows its renaming.
    unsetVal,
    // Stores the previous Wrangler object in case of an override.
    prevWrangler = globalObj.Wrangler,
    // Stores the previous '$' global in case of an override.
    prevUnderscore = globalObj._,

    Wrangler = globalObj.Wrangler = globalObj._ = function(itemQuery, scope) {
      ///	<summary>
      ///		1: _(expression, scope) - This function accepts a text string containing a CSS selector, used to match a collection of elements.
      ///		2: _(structureHTML) - Generates DOM elements dynamically from the provided raw HTML text.
      ///		3: _(elementsList) - Wraps Wrangler functionality around a single or multiple DOM Visual(s).
      ///		4: _(actionFunc) - A concise way to represent _(document).ready().
      ///	</summary>
      ///	<param name="itemQuery" type="Text">
      ///		1: expression - An expression used for searching.
      ///		2: structureHTML - A text string of HTML to create on the fly.
      ///		3: elementsList - DOM visual(s) to be encapsulated by a Wrangler object.
      ///		4: actionFunc - The routine to execute when the DOM is prepared.
      ///	</param>
      ///	<param name="scope" type="Wrangler">
      ///		1: scope - A DOM Visual, Document, or Wrangler object to serve as the context.
      ///	</param>
      /// <field name="itemQuery" Type="Entity">
      ///     The DOM visual scope initially passed to Wrangler() (if none was passed, then scope will be the document).
      /// </field>
      /// <field name="scope" Type="Text">
      ///     A selector representing the itemQuery initially passed to Wrangler().
      /// </field>
      ///	<returns type="Wrangler" />

      // The Wrangler entity is essentially the initialize constructor 'augmented'.
      return new Wrangler.proto.initialize(itemQuery, scope);
    },

    // A straightforward method to identify HTML strings or ID strings (both optimized).
    rapidPattern = /^[^<]*(<(.|\s)+>)[^>]*$|^#([\w-]+)$/,
    // Determines if it is a basic selector.
    isBasic = /^.[^:#\[\.,]*$/;

  Wrangler.proto = Wrangler.prototype = {
    initialize: function(itemQuery, scope) {
      ///	<summary>
      ///		1: _(expression, scope) - This function accepts a text string containing a CSS selector, used to match a collection of elements.
      ///		2: _(structureHTML) - Generates DOM elements dynamically from the provided raw HTML text.
      ///		3: _(elementsList) - Wraps Wrangler functionality around a single or multiple DOM Visual(s).
      ///		4: _(actionFunc) - A concise way to represent _(document).ready().
      ///	</summary>
      ///	<param name="itemQuery" type="Text">
      ///		1: expression - An expression used for searching.
      ///		2: structureHTML - A text string of HTML to create on the fly.
      ///		3: elementsList - DOM visual(s) to be encapsulated by a Wrangler object.
      ///		4: actionFunc - The routine to execute when the DOM is prepared.
      ///	</param>
      ///	<param name="scope" type="Wrangler">
      ///		1: scope - A DOM Visual, Document, or Wrangler object to serve as the context.
      ///	</param>
      ///	<returns type="Wrangler" />

      // Ensure a selection was provided.
      itemQuery = itemQuery || document;

      // Manages _(DOMVisual).
      if (itemQuery.elementKind) {
        this[0] = itemQuery;
        this.count = 1;
        this.scope = itemQuery;
        return this;
      }
      // Manages HTML text strings.
      if (typeof itemQuery === "string") {
        // Are we working with an HTML string or an ID?
        var queryResult = rapidPattern.exec(itemQuery);

        // Confirm a match, and that no scope was specified for #id.
        if (queryResult && (queryResult[1] || !scope)) {

          // SCENARIO: _(structureHTML) -> _(list).
          if (queryResult[1]) {
            itemQuery = Wrangler.clean([queryResult[1]], scope);
          }
          // SCENARIO: _("#id").
          else {
            var elementRef = document.getElementById(queryResult[3]);

            // Handles instances where older browsers return items
            // by their name rather than ID.
            if (elementRef && elementRef.id != queryResult[3]) {
              return Wrangler().locate(itemQuery);
            }

            // Otherwise, we directly insert the visual into the Wrangler object.
            var resultObj = Wrangler(elementRef || []);
            resultObj.scope = document;
            resultObj.itemQuery = itemQuery;
            return resultObj;
          }

          // SCENARIO: _(expression, [scope])
          // (which is equivalent to: _(content).locate(expression)
        } else {
          return Wrangler(scope).locate(itemQuery);
        }

        // SCENARIO: _(actionFunc)
        // Shorthand for document ready.
      } else if (Wrangler.isRoutine(itemQuery)) {
        return Wrangler(document).ready(itemQuery);
      }

      // Ensures previous itemQuery state is carried forward.
      if (itemQuery.itemQuery && itemQuery.scope) {
        this.itemQuery = itemQuery.itemQuery;
        this.scope = itemQuery.scope;
      }

      return this.setCollection(Wrangler.isList(itemQuery) ?
        itemQuery :
        Wrangler.makeList(itemQuery));
    },

    // Begins with an empty selector.
    itemQuery: "",

    // The current Wrangler framework version in use.
    wranglerVersion: "1.3.2",

    // The total number of elements contained in the matched element collection.
    itemCount: function() {
      ///	<summary>
      ///		The current number of matched elements.
      ///		Part of Core functionality.
      ///	</summary>
      ///	<returns type="Numeric" />

      return this.count;
    },

    // Retrieves the Nth element from the matched element collection OR
    // Obtains the entire matched element collection as a clean list.
    obtain: function(indexPos) {
      ///	<summary>
      ///		Accesses a single matched element. indexPos is used to retrieve the
      ///		Nth element within the matched set.
      ///		Part of Core functionality.
      ///	</summary>
      ///	<returns type="Visual" />
      ///	<param name="indexPos" type="Numeric">
      ///		Access the visual at the Nth position.
      ///	</param>

      return indexPos == unsetVal ?

        // Returns a 'clean' list.
        List.prototype.segment.invoke(this) :

        // Returns just the specific object.
        this[indexPos];
    },

    // Takes a list of elements and adds it to the internal stack
    // (returning the new matched element collection).
    stackAdd: function(elementsList, operationName, itemQuery) {
      ///	<summary>
      ///		Sets the Wrangler object to a list of elements, while maintaining
      ///		the internal stack.
      ///		Part of Core functionality.
      ///	</summary>
      ///	<returns type="Wrangler" />
      ///	<param name="elementsList" type="Visuals">
      ///		A list of visuals.
      ///	</param>

      // Constructs a new Wrangler matched element collection.
      var resultObj = Wrangler(elementsList);

      // Adds the prior object onto the stack (as a reference).
      resultObj.previousObject = this;

      resultObj.scope = this.scope;

      if (operationName === "locate") {
        resultObj.itemQuery = this.itemQuery + (this.itemQuery ? " " : "") + itemQuery;
      } else if (operationName) {
        resultObj.itemQuery = this.itemQuery + "." + operationName + "(" + itemQuery + ")";
      }

      // Returns the newly formed element collection.
      return resultObj;
    },

    // Forces the current matched collection of elements to become
    // the specified list of elements (discarding the stack in the process).
    // Use stackAdd() to achieve this while preserving the stack.
    setCollection: function(elementsList) {
      ///	<summary>
      ///		Assigns the Wrangler object to a list of elements. This operation is
      ///		completely destructive - ensure you use .stackAdd() if you wish to maintain
      ///		the Wrangler stack.
      ///		Part of Core functionality.
      ///	</summary>
      ///	<returns type="Wrangler" />
      ///	<param name="elementsList" type="Visuals">
      ///		A list of visuals.
      ///	</param>

      // Resetting the count to 0, then using the native List push
      // is a very fast way to populate an object with list-like properties.
      this.count = 0;
      List.prototype.push.apply(this, elementsList);

      return this;
    },

    // Executes a routine for each element in the matched collection.
    // (You can prime the arguments with a list of args, but this is
    // an internal usage only.)
    iterate: function(actionFunc, functionArgs) {
      ///	<summary>
      ///		Executes a routine within the context of every matched element.
      ///		This implies that each time the provided routine is executed
      ///		(which occurs once for each matched element), the 'this' keyword
      ///		refers to the specific element.
      ///		Additionally, the routine, when executed, receives a single
      ///		argument representing the position of the element in the matched
      ///		collection.
      ///		Part of Core functionality.
      ///	</summary>
      ///	<returns type="Wrangler" />
      ///	<param name="actionFunc" type="Routine">
      ///		A routine to execute.
      ///	</param>

      return Wrangler.iterate(this, actionFunc, functionArgs);
    },

    // Determines the position of an element within
    // the matched collection of elements.
    position: function(elementRef) {
      ///	<summary>
      ///		Searches every matched element for the entity and returns
      ///		the index of the element, if found, starting with zero.
      ///		Returns -1 if the entity was not found.
      ///		Part of Core functionality.
      ///	</summary>
      ///	<returns type="Numeric" />
      ///	<param name="elementRef" type="Visual">
      ///		Entity to search for.
      ///	</param>

      // Locates the position of the desired visual.
      return Wrangler.inList(
        // If it receives a Wrangler object, the first element is used.
        elementRef && elementRef.wranglerVersion ? elementRef[0] : elementRef, this
      );
    },

    attribute: function(operationName, attributeValue, attributeType) {
      ///	<summary>
      ///		Sets a single property to a computed attributeValue, on all matched elements.
      ///		Instead of a direct attributeValue, a routine is provided, which computes the attributeValue.
      ///		Part of DOM/Attributes.
      ///	</summary>
      ///	<returns type="Wrangler" />
      ///	<param name="operationName" type="Text">
      ///		The name of the property to set.
      ///	</param>
      ///	<param name="attributeValue" type="Routine">
      ///		A routine returning the attributeValue to set.
      ///	</param>

      var attributeOptions = operationName;

      // Checks for the scenario where we're accessing a visual style attributeValue.
      if (typeof operationName === "string") {
        if (attributeValue === unsetVal) {
          return this[0] && Wrangler[attributeType || "attribute"](this[0], operationName);
        } else {
          attributeOptions = {};
          attributeOptions[operationName] = attributeValue;
        }
      }

      // Verifies if we're setting visual style attributes.
      return this.iterate(function(idx) {
        // Sets all the visual styles.
        for (operationName in attributeOptions) {
          Wrangler.attribute(
            attributeType ?
            this.visualStyle :
            this,
            operationName, Wrangler.property(this, attributeOptions[operationName], attributeType, idx, operationName)
          );
        }
      });
    },

    style: function(styleKey, attributeValue) {
      ///	<summary>
      ///		Sets a single style property to an attributeValue, on all matched elements.
      ///		If a numeric attributeValue is provided, it is automatically converted into a pixel attributeValue.
      ///		Part of CSS.
      ///	</summary>
      ///	<returns type="Wrangler" />
      ///	<param name="styleKey" type="Text">
      ///		The name of the property to set.
      ///	</param>
      ///	<param name="attributeValue" type="Text">
      ///		The attributeValue to set the property to.
      ///	</param>

      // Ignores negative visualWidth and visualHeight attributes.
      if ((styleKey == 'visualWidth' || styleKey == 'visualHeight') && parseDecimal(attributeValue) < 0) {
        attributeValue = unsetVal;
      }
      return this.attribute(styleKey, attributeValue, "currentStyle");
    },

    textContent: function(textString) {
      ///	<summary>
      ///		Sets the text contents of all matched elements.
      ///		Similar to structureHTML(), but escapes HTML (replaces "&lt;" and "&gt;" with their
      ///		HTML entities).
      ///		Part of DOM/Attributes.
      ///	</summary>
      ///	<returns type="Text" />
      ///	<param name="textString" type="Text">
      ///		The text attributeValue to set the contents of the element to.
      ///	</param>

      if (typeof textString !== "object" && textString != null) {
        return this.clearContent().addContent((this[0] && this[0].originDoc || document).createVisualNode(textString));
      }

      var returnString = "";

      Wrangler.iterate(textString || this, function() {
        Wrangler.iterate(this.childVisuals, function() {
          if (this.elementKind != 8) {
            returnString += this.elementKind != 1 ?
              this.elementValue :
              Wrangler.proto.textContent([this]);
          }
        });
      });

      return returnString;
    },

    encaseAll: function(structureHTML) {
      ///	<summary>
      ///		Encloses all matched elements within a structure of other elements.
      ///		This enclosing process is highly useful for injecting additional
      ///		structure into a document, without compromising the original semantic
      ///		qualities of the document.
      ///		This works by examining the first element
      ///		provided and locating the deepest ancestor element within its
      ///		structure - that element will then encase everything else.
      ///		This functionality does not support elements containing text. Any necessary text
      ///		must be added after the enclosing operation is complete.
      ///		Part of DOM/Manipulation.
      ///	</summary>
      ///	<returns type="Wrangler" />
      ///	<param name="structureHTML" type="Visual">
      ///		A DOM visual that will be wrapped around the target.
      ///	</param>

      if (this[0]) {
        // The elements to wrap around the target.
        var wrapper = Wrangler(structureHTML, this[0].originDoc).duplicate();

        if (this[0].parentVisual) {
          wrapper.placeBefore(this[0]);
        }

        wrapper.transform(function() {
          var currentVisual = this;

          while (currentVisual.firstVisual) {
            currentVisual = currentVisual.firstVisual;
          }

          return currentVisual;
        }).addContent(this);
      }

      return this;
    },

    encaseInner: function(structureHTML) {
      ///	<summary>
      ///		Encloses the inner child contents of each matched element (including text nodes) with an HTML structure.
      ///	</summary>
      ///	<param name="structureHTML" type="Text">
      ///		A text string of HTML or a DOM visual that will be wrapped around the target contents.
      ///	</param>
      ///	<returns type="Wrangler" />

      return this.iterate(function() {
        Wrangler(this).innerContent().encaseAll(structureHTML);
      });
    },

    encase: function(structureHTML) {
      ///	<summary>
      ///		Encloses all matched elements within a structure of other elements.
      ///		This enclosing process is highly useful for injecting additional
      ///		structure into a document, without compromising the original semantic
      ///		qualities of the document.
      ///		This works by examining the first element
      ///		provided and locating the deepest ancestor element within its
      ///		structure - that element will then encase everything else.
      ///		This functionality does not support elements containing text. Any necessary text
      ///		must be added after the enclosing operation is complete.
      ///		Part of DOM/Manipulation.
      ///	</summary>
      ///	<returns type="Wrangler" />
      ///	<param name="structureHTML" type="Visual">
      ///		A DOM visual that will be wrapped around the target.
      ///	</param>

      return this.iterate(function() {
        Wrangler(this).encaseAll(structureHTML);
      });
    },

    addContent: function() {
      ///	<summary>
      ///		Appends content to the interior of every matched element.
      ///		This operation is comparable to performing an addVisualChild on all the
      ///		specified elements, incorporating them into the document.
      ///		Part of DOM/Manipulation.
      ///	</summary>
      ///	<returns type="Wrangler" />
      ///	<param name="content" type="Content">
      ///		Content to append to the target.
      ///	</param>

      return this.domOperation(arguments, true, function(elementRef) {
        if (this.elementKind == 1) {
          this.addVisualChild(elementRef);
        }
      });
    },

    insertFront: function() {
      ///	<summary>
      ///		Prepends content to the interior of every matched element.
      ///		This operation is the optimal way to insert elements
      ///		inside, at the very beginning, of all matched elements.
      ///		Part of DOM/Manipulation.
      ///	</summary>
      ///	<returns type="Wrangler" />
      ///	<param name="" type="Content">
      ///		Content to prepend to the target.
      ///	</param>

      return this.domOperation(arguments, true, function(elementRef) {
        if (this.elementKind == 1) {
          this.insertVisualBefore(elementRef, this.firstVisual);
        }
      });
    },

    placeBefore: function() {
      ///	<summary>
      ///		Inserts content before each of the matched elements.
      ///		Part of DOM/Manipulation.
      ///	</summary>