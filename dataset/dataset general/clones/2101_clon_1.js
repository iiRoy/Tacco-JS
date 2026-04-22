// This file contains a Type I clone of the original NicEdit JavaScript library.
// All functional code, variable names, and operators are preserved exactly.
// Only whitespace, indentation, and comments have been altered significantly
// to create a visually distinct but semantically identical copy.

var    bkExtend    =    function()    {

 var args = arguments;

  // If only one argument is provided, assume it's the source object
  // and the target is 'this'.
 if ( args.length == 1 )
 {
  args = [ this, args[0] ];
 }

 // Iterate over properties of the source object and copy them to the target.
 for ( var prop in args[1] )
 {
  args[0][prop] = args[1][prop];
 }

 // Return the extended target object.
 return args[0];
};

function bkClass()
{
 // Constructor for the base class.
 // Intentionally empty, as actual construction logic is in `construct`.
}

// Define the 'construct' method on the prototype, to be overridden by subclasses.
bkClass.prototype.construct = function() { /* Placeholder for constructor logic */ };

// Static method to extend bkClass, creating a new subclass.
bkClass.extend = function(def)
{
 // Define the new class constructor.
 var classDef = function()
 {
  // If the first argument is not bkClass, then call the actual constructor.
  // This check prevents the `new this(bkClass)` call from triggering construct.
  if ( arguments[0] !== bkClass )
  {
   return this.construct.apply(this, arguments);
  }
 };

 // Create a new instance of the parent class, passing bkClass as a dummy argument.
 // This ensures `construct` is not called for the prototype chain setup.
 var proto = new this(bkClass);

 // Extend the prototype of the new class with the definition provided.
 bkExtend(proto, def);

 // Set the prototype of the new class constructor.
 classDef.prototype = proto;

 // Inherit the `extend` static method from the parent class.
 classDef.extend = this.extend;

 // Return the newly created class definition.
 return classDef;
};

// Define the bkElement class, extending bkClass.
var bkElement = bkClass.extend({

 // Constructor for bkElement.
 construct : function(elm, d)
 {
  // If 'elm' is a string, create a new HTML element.
  if ( typeof(elm) == "string" )
  {
   elm = (d || document).createElement(elm);
  }

  // Wrap the element with $BK to ensure it has bkElement methods.
  elm = $BK(elm);

  return elm;
 },

 // Appends this element to another specified element.
 appendTo : function(elm)
 {
  elm.appendChild(this);
  return this;
 },

 // Inserts this element before another specified element.
 appendBefore : function(elm)
 {
  elm.parentNode.insertBefore(this, elm);
  return this;
 },

 // Adds an event listener to this element.
 addEvent : function(type, fn)
 {
  bkLib.addEvent(this, type, fn);
  return this;
 },

 // Sets the inner HTML content of this element.
 setContent : function(c)
 {
  this.innerHTML = c;
  return this;
 },

 // Calculates and returns the absolute position and bottom coordinate of the element.
 pos : function()
 {
  var curleft = 0, curtop = 0; // Initialize current left and top positions.
  var o = this, obj = this; // 'o' for original, 'obj' for traversal.

  // Traverse up the offsetParent chain to sum up offsets.
  if ( obj.offsetParent )
  {
   do
   {
    curleft += obj.offsetLeft;
    curtop += obj.offsetTop;
   }
   while ( obj = obj.offsetParent ); // Loop until obj has no offsetParent.
  }

  // Calculate border width (handling IE/Opera differences).
  var b = (!window.opera) ? parseInt(this.getStyle('border-width') || this.style.border) || 0 : 0;

  // Return an array with [left + border, top + border + height].
  return [ curleft + b, curtop + b + this.offsetHeight ];
 },

 // Prevents text selection within this element.
 noSelect : function()
 {
  bkLib.noSelect(this);
  return this;
 },

 // Finds the nearest parent element with a specific tag name.
 parentTag : function(t)
 {
  var elm = this; // Start search from the current element.

  do
  {
   // Check if the element exists, has a nodeName, and matches the target tag (case-insensitive).
   if ( elm && elm.nodeName && elm.nodeName.toUpperCase() == t )
   {
    return elm;
   }
   elm = elm.parentNode; // Move up to the parent.
  }
  while ( elm ); // Continue until there's no parent.

  return false; // Return false if no matching parent is found.
 },

 // Checks if the element has a specific class.
 hasClass : function(cls)
 {
  // Use a regular expression to match the class name, ensuring whole word match.
  return this.className.match(new RegExp('(\\s|^)nicEdit-' + cls + '(\\s|$)'));
 },

 // Adds a class to the element if it doesn't already have it.
 addClass : function(cls)
 {
  // Only add if the class is not already present.
  if ( !this.hasClass(cls) )
  {
   this.className += " nicEdit-" + cls;
  }
  return this;
 },

 // Removes a class from the element if it has it.
 removeClass : function(cls)
 {
  // Only remove if the class is present.
  if ( this.hasClass(cls) )
  {
   // Replace the class with a space, effectively removing it.
   this.className = this.className.replace(new RegExp('(\\s|^)nicEdit-' + cls + '(\\s|$)'), ' ');
  }
  return this;
 },

 // Sets multiple CSS styles for the element.
 setStyle : function(st)
 {
  var elmStyle = this.style; // Get the element's style object for efficiency.

  for ( var itm in st )
  {
   // Handle browser-specific or special CSS properties.
   switch ( itm )
   {
    case 'float':
     elmStyle['cssFloat'] = elmStyle['styleFloat'] = st[itm]; // Cross-browser float.
     break;
    case 'opacity':
     elmStyle.opacity = st[itm]; // Standard opacity.
     elmStyle.filter = "alpha(opacity=" + Math.round(st[itm] * 100) + ")"; // IE opacity filter.
     break;
    case 'className':
     this.className = st[itm]; // Set class name directly.
     break;
    default:
     // Default case: assign style directly.
     // The commented out section was a workaround for IE 5.5, now removed.
     // if(document.compatMode || itm != "cursor") {
     elmStyle[itm] = st[itm];
     // }
   }
  }
  return this;
 },

 // Gets the computed style of the element for a given CSS rule.
 getStyle : function(cssRule, d)
 {
  var doc = (!d) ? document.defaultView : d; // Get the default view or provided document.

  if ( this.nodeType == 1 ) // Ensure it's an element node.
  {
   // Use standard getComputedStyle or IE's currentStyle.
   return (doc && doc.getComputedStyle) ? doc.getComputedStyle(this, null).getPropertyValue(cssRule) : this.currentStyle[bkLib.camelize(cssRule)];
  }
 },

 // Removes the element from its parent.
 remove : function()
 {
  this.parentNode.removeChild(this);
  return this;
 },

 // Sets multiple attributes for the element.
 setAttributes : function(at)
 {
  for ( var itm in at )
  {
   this[itm] = at[itm]; // Assign attribute directly.
  }
  return this;
 }

});

// Global utility library.
var bkLib = {

 // Property to detect if the browser is MSIE.
 isMSIE : (navigator.appVersion.indexOf("MSIE") != -1),

 // Cross-browser event adding utility.
 addEvent : function(obj, type, fn)
 {
  (obj.addEventListener) ? obj.addEventListener(type, fn, false) : obj.attachEvent("on" + type, fn);
 },

 // Converts an iterable (like NodeList) to a true Array.
 toArray : function(iterable)
 {
  var length = iterable.length, results = new Array(length);
  while ( length-- )
  {
   results[length] = iterable[length];
  }
  return results;
 },

 // Prevents selection on an element and its children.
 noSelect : function(element)
 {
  // Set 'unselectable' attribute for non-input/textarea elements.
  if ( element.setAttribute && element.nodeName.toLowerCase() != 'input' && element.nodeName.toLowerCase() != 'textarea' )
  {
   element.setAttribute('unselectable', 'on');
  }

  // Recursively apply to child nodes.
  for ( var i = 0; i < element.childNodes.length; i++ )
  {
   bkLib.noSelect(element.childNodes[i]);
  }
 },

 // Converts a hyphenated string to camelCase (e.g., 'font-size' to 'fontSize').
 camelize : function(s)
 {
  return s.replace(/\-(.)/g, function(m, l) { return l.toUpperCase(); });
 },

 // Checks if an item exists in an array.
 inArray : function(arr, item)
 {
  return (bkLib.search(arr, item) != null);
 },

 // Searches for an item in an array and returns its index, or null if not found.
 search : function(arr, itm)
 {
  for ( var i = 0; i < arr.length; i++ )
  {
   if ( arr[i] == itm )
    return i;
  }
  return null;
 },

 // Cancels an event's default action and propagation.
 cancelEvent : function(e)
 {
  e = e || window.event; // Get event object.
  if ( e.preventDefault && e.stopPropagation )
  {
   e.preventDefault();
   e.stopPropagation();
  }
  return false;
 },

 domLoad : [], // Array to hold functions to execute on DOM loaded.

 // Function called when the DOM is fully loaded.
 domLoaded : function()
 {
  // Ensure this runs only once.
  if ( arguments.callee.done )
   return;
  arguments.callee.done = true;

  // Execute all registered functions.
  for ( i = 0; i < bkLib.domLoad.length; i++ )
  {
   bkLib.domLoad[i]();
  }
 },

 // Registers a function to be executed when the DOM is loaded.
 onDomLoaded : function(fireThis)
 {
  this.domLoad.push(fireThis); // Add function to the queue.

  if ( document.addEventListener )
  {
   // Standard DOMContentLoaded event.
   document.addEventListener("DOMContentLoaded", bkLib.domLoaded, null);
  }
  else if ( bkLib.isMSIE )
  {
   // IE-specific defer script method.
   document.write("<style>.nicEdit-main p { margin: 0; }</style><scr" + "ipt id=__ie_onload defer " + ((location.protocol == "https:") ? "src='javascript:void(0)'" : "src=//0") + "><\\/scr" + "ipt>");
   $BK("__ie_onload").onreadystatechange = function()
   {
    if ( this.readyState == "complete" )
    {
     bkLib.domLoaded();
    }
   };
  }
  window.onload = bkLib.domLoaded; // Fallback for older browsers or if DOMContentLoaded fails.
 }

};

// Global helper function to get an element by ID or wrap an existing element.
function $BK(elm)
{
 // If input is a string, treat it as an ID.
 if ( typeof(elm) == "string" )
 {
  elm = document.getElementById(elm);
 }

 // If the element exists and doesn't already have bkElement methods (like appendTo),
 // extend it with bkElement.prototype.
 return (elm && !elm.appendTo) ? bkExtend(elm, bkElement.prototype) : elm;
}

// Event handling mixin.
var bkEvent = {

 // Adds an event listener to the object's internal event list.
 addEvent : function(evType, evFunc)
 {
  if ( evFunc )
  {
   this.eventList = this.eventList || {}; // Initialize eventList if it doesn't exist.
   this.eventList[evType] = this.eventList[evType] || []; // Initialize event type array.
   this.eventList[evType].push(evFunc); // Add the function.
  }
  return this;
 },

 // Fires all registered event listeners for a given event type.
 fireEvent : function()
 {
  var args = bkLib.toArray(arguments), // Convert arguments to an array.
  evType = args.shift(); // First argument is the event type.

  if ( this.eventList && this.eventList[evType] )
  {
   // Call each registered function with the remaining arguments.
   for ( var i = 0; i < this.eventList[evType].length; i++ )
   {
    this.eventList[evType][i].apply(this, args);
   }
  }
 }

};

// Simple localization function (identity function for English).
function __(s)
{
 return s;
}

// Extends Function prototype to create a closure for a method.
Function.prototype.closure = function()
{
 var __method = this, // Store the original method.
 args = bkLib.toArray(arguments), // Convert arguments to array.
 obj = args.shift(); // First argument is the object context.

 return function()
 {
  // Only execute if bkLib is defined (prevents errors during script loading).
  if ( typeof(bkLib) != 'undefined' )
  {
   // Apply the original method with the stored object and combined arguments.
   return __method.apply(obj, args.concat(bkLib.toArray(arguments)));
  }
 };
};

// Extends Function prototype to create a closure for an event listener.
Function.prototype.closureListener = function()
{
 var __method = this, // Store the original method.
 args = bkLib.toArray(arguments), // Convert arguments to array.
 object = args.shift(); // First argument is the object context.

 return function(e)
 {
  e = e || window.event; // Get the event object (cross-browser).

  // Determine the event target.
  if ( e.target )
  {
   var target = e.target;
  }
  else
  {
   var target = e.srcElement;
  }

  // Apply the original method with event, target, and remaining arguments.
  return __method.apply(object, [e, target].concat(args));
 };
};

// Configuration class for NicEdit.
var nicEditorConfig = bkClass.extend({

 // Button definitions, including names, commands, tags, CSS, and keyboard shortcuts.
 buttons : {
  'bold' : {name : __('Click to Bold'), command : 'Bold', tags : ['B', 'STRONG'], css : {'font-weight' : 'bold'}, key : 'b'},
  'italic' : {name : __('Click to Italic'), command : 'Italic', tags : ['EM', 'I'], css : {'font-style' : 'italic'}, key : 'i'},
  'underline' : {name : __('Click to Underline'), command : 'Underline', tags : ['U'], css : {'text-decoration' : 'underline'}, key : 'u'},
  'left' : {name : __('Left Align'), command : 'justifyleft', noActive : true},
  'center' : {name : __('Center Align'), command : 'justifycenter', noActive : true},
  'right' : {name : __('Right Align'), command : 'justifyright', noActive : true},
  'justify' : {name : __('Justify Align'), command : 'justifyfull', noActive : true},
  'ol' : {name : __('Insert Ordered List'), command : 'insertorderedlist', tags : ['OL']},
  'ul' : {name : __('Insert Unordered List'), command : 'insertunorderedlist', tags : ['UL']},
  'subscript' : {name : __('Click to Subscript'), command : 'subscript', tags : ['SUB']},
  'superscript' : {name : __('Click to Superscript'), command : 'superscript', tags : ['SUP']},
  'strikethrough' : {name : __('Click to Strike Through'), command : 'strikeThrough', css : {'text-decoration' : 'line-through'}},
  'removeformat' : {name : __('Remove Formatting'), command : 'removeformat', noActive : true},
  'indent' : {name : __('Indent Text'), command : 'indent', noActive : true},
  'outdent' : {name : __('Remove Indent'), command : 'outdent', noActive : true},
  'hr' : {name : __('Horizontal Rule'), command : 'insertHorizontalRule', noActive : true}
 },

 iconsPath : '../nicEditorIcons.gif', // Path to the icon sprite image.

 // Default list of buttons to display in the editor toolbar.
 buttonList : ['save', 'bold', 'italic', 'underline', 'left', 'center', 'right', 'justify', 'ol', 'ul', 'fontSize', 'fontFamily', 'fontFormat', 'indent', 'outdent', 'image', 'upload', 'link', 'unlink', 'forecolor', 'bgcolor'],

 // Mapping of icon names to their position in the sprite.
 iconList : {"xhtml":1, "bgcolor":2, "forecolor":3, "bold":4, "center":5, "hr":6, "indent":7, "italic":8, "justify":9, "left":10, "ol":11, "outdent":12, "removeformat":13, "right":14, "save":25, "strikethrough":16, "subscript":17, "superscript":18, "ul":19, "underline":20, "image":21, "link":22, "unlink":23, "close":24, "arrow":26, "upload":27}

});

// Global object for managing NicEdit instances and plugins.
var nicEditors = {

 nicPlugins : [], // Array to store registered plugins.
 editors : [], // Array to store all active nicEditor instances.

 // Registers a new plugin.
 registerPlugin : function(plugin, options)
 {
  this.nicPlugins.push({p : plugin, o : options});
 },

 // Converts all textareas on the page into nicEditor instances.
 allTextAreas : function(nicOptions)
 {
  var textareas = document.getElementsByTagName("textarea");

  for ( var i = 0; i < textareas.length; i++ )
  {
   nicEditors.editors.push(new nicEditor(nicOptions).panelInstance(textareas[i]));
  }
  return nicEditors.editors;
 },

 // Finds an editor instance by its associated element.
 findEditor : function(e)
 {
  var editors = nicEditors.editors;

  for ( var i = 0; i < editors.length; i++ )
  {
   if ( editors[i].instanceById(e) )
   {
    return editors[i].instanceById(e);
   }
  }
 }

};

// Main nicEditor class.
var nicEditor = bkClass.extend({

 // Constructor for nicEditor.
 construct : function(o)
 {
  this.options = new nicEditorConfig(); // Initialize options with default config.
  bkExtend(this.options, o); // Extend with provided options.
  this.nicInstances = new Array(); // Stores individual editor instances.
  this.loadedPlugins = new Array(); // Stores loaded plugin instances.

  var plugins = nicEditors.nicPlugins;
  for ( var i = 0; i < plugins.length; i++ )
  {
   this.loadedPlugins.push(new plugins[i].p(this, plugins[i].o)); // Instantiate and load plugins.
  }
  nicEditors.editors.push(this); // Add this editor to the global list.

  // Add a global mousedown event listener to handle editor selection/blur.
  bkLib.addEvent(document.body, 'mousedown', this.selectCheck.closureListener(this));
 },

 // Creates a panel for an instance and adds the instance.
 panelInstance : function(e, o)
 {
  e = this.checkReplace($BK(e)); // Ensure element is wrapped and replace existing editor if any.

  // Create a DIV for the panel and set its width.
  var panelElm = new bkElement('DIV').setStyle({width : (parseInt(e.getStyle('width')) || e.clientWidth) + 'px'}).appendBefore(e);

  this.setPanel(panelElm); // Set this panel as the editor's panel.
  return this.addInstance(e, o); // Add the actual editor instance.
 },

 // Checks if an element already has an editor, and removes it if so.
 checkReplace : function(e)
 {
  var r = nicEditors.findEditor(e); // Try to find an existing editor for this element.

  if ( r )
  {
   r.removeInstance(e); // Remove the instance.
   r.removePanel(); // Remove its panel.
  }
  return e; // Return the (now clean) element.
 },

 // Adds a new editable instance to the editor.
 addInstance : function(e, o)
 {
  e = this.checkReplace($BK(e)); // Prepare the element.

  var newInstance;
  // Determine whether to use a contentEditable DIV or an IFRAME.
  if ( e.contentEditable || !!window.opera )
  {
   newInstance = new nicEditorInstance(e, o, this);
  }
  else
  {
   // Assuming nicEditorIFrameInstance exists elsewhere in the original code.
   newInstance = new nicEditorIFrameInstance(e, o, this);
  }
  this.nicInstances.push(newInstance); // Add the new instance.
  return this;
 },

 // Removes an editor instance.
 removeInstance : function(e)
 {
  e = $BK(e); // Ensure element is wrapped.
  var instances = this.nicInstances;

  for ( var i = 0; i < instances.length; i++ )
  {
   if ( instances[i].e == e )
   {
    instances[i].remove(); // Call the instance's remove method.
    this.nicInstances.splice(i, 1); // Remove from the array.
   }
  }
 },

 // Removes the editor's panel.
 removePanel : function(e)
 {
  if ( this.nicPanel )
  {
   this.nicPanel.remove(); // Remove the panel element.
   this.nicPanel = null; // Clear reference.
  }
 },

 // Finds an editor instance within this editor by element.
 instanceById : function(e)
 {
  e = $BK(e); // Ensure element is wrapped.
  var instances = this.nicInstances;

  for ( var i = 0; i < instances.length; i++ )
  {
   if ( instances[i].e == e )
   {
    return instances[i];
   }
  }
 },

 // Sets the editor's panel.
 setPanel : function(e)
 {
  // Create a new nicEditorPanel instance.
  this.nicPanel = new nicEditorPanel($BK(e), this.options, this);
  this.fireEvent('panel', this.nicPanel); // Fire 'panel' event.
  return this;
 },

 // Executes a command on the currently selected editor instance.
 nicCommand : function(cmd, args)
 {
  if ( this.selectedInstance )
  {
   this.selectedInstance.nicCommand(cmd, args);
  }
 },

 // Gets CSS properties for an icon based on its name and options.
 getIcon : function(iconName, options)
 {
  var icon = this.options.iconList[iconName]; // Get icon position from global list.
  var file = (options.iconFiles) ? options.iconFiles[iconName] : ''; // Get custom icon file if specified.

  // Return style object for background image and position.
  return {backgroundImage : "url('" + ((icon) ? this.options.iconsPath : file) + "')", backgroundPosition : ((icon) ? ((icon - 1) * -18) : 0) + 'px 0px'};
 },

 // Checks if a click event is within an editor or outside, handling blur.
 selectCheck : function(e, t)
 {
  var found = false;
  do
  {
   // If the target element or its parent has 'nicEdit' in its class, it's part of the editor.
   if ( t.className && t.className.indexOf('nicEdit') != -1 )
   {
    return false; // Don't blur if clicking inside nicEdit.
   }
  }
  while ( t = t.parentNode ); // Traverse up the DOM.

  this.fireEvent('blur', this.selectedInstance, t); // Fire 'blur' event.
  this.lastSelectedInstance = this.selectedInstance; // Store last selected.
  this.selectedInstance = null; // Clear current selection.
  return false;
 }

});

// Extend nicEditor with bkEvent methods.
nicEditor = nicEditor.extend(bkEvent);

// Represents a single editable contentEditable DIV instance.
var nicEditorInstance = bkClass.extend({

 isSelected : false, // Flag indicating if this instance is currently selected.

 // Constructor for nicEditorInstance.
 construct : function(e, options, nicEditor)
 {
  this.ne = nicEditor; // Reference to the main nicEditor object.
  this.elm = this.e = e; // The original element.
  this.options = options || {}; // Options for this instance.

  // Calculate initial dimensions.
  newX = parseInt(e.getStyle('width')) || e.clientWidth;
  newY = parseInt(e.getStyle('height')) || e.clientHeight;
  this.initialHeight = newY - 8;

  var isTextarea = (e.nodeName.toLowerCase() == "textarea");

  // If it's a textarea or has a panel, create the wrapper DIV.
  if ( isTextarea || this.options.hasPanel )
  {
   // IE7-specific styles.
   var ie7s = (bkLib.isMSIE && !((typeof document.body.style.maxHeight != "undefined") && document.compatMode == "CSS1Compat"));

   // Styles for the editor container.
   var s = {width: newX + 'px', border : '1px solid #ccc', borderTop : 0, overflowY : 'auto', overflowX: 'hidden'};
   s[(ie7s) ? 'height' : 'maxHeight'] = (this.ne.options.maxHeight) ? this.ne.options.maxHeight + 'px' : null;

   // Create the container DIV and insert it before the original element.
   this.editorContain = new bkElement('DIV').setStyle(s).appendBefore(e);

   // Create the actual editable DIV within the container.
   var editorElm = new bkElement('DIV').setStyle({width : (newX - 8) + 'px', margin: '4px', minHeight : newY + 'px'}).addClass('main').appendTo(this.editorContain);

   e.setStyle({display : 'none'}); // Hide the original element.

   editorElm.innerHTML = e.innerHTML; // Copy content.

   if ( isTextarea )
   {
    editorElm.setContent(e.value); // If textarea, copy its value.
    this.copyElm = e; // Keep a reference to the original textarea.

    var f = e.parentTag('FORM'); // Find parent form.
    if ( f )
    {
     // On form submit, save content back to textarea.
     bkLib.addEvent(f, 'submit', this.saveContent.closure(this));
    }
   }

   // Set height/overflow for the editable DIV.
   editorElm.setStyle((ie7s) ? {height : newY + 'px'} : {overflow: 'hidden'});
   this.elm = editorElm; // Update 'elm' to point to the editable DIV.
  }

  this.ne.addEvent('blur', this.blur.closure(this)); // Add blur event listener.

  this.init(); // Initialize the instance.
  this.blur(); // Trigger initial blur to set state.
 },

 // Initializes the editor instance.
 init : function()
 {
  this.elm.setAttribute('contentEditable', 'true'); // Make the element editable.

  if ( this.getContent() == "" )
  {
   this.setContent('<br />'); // Ensure there's content for cursor placement.
  }
  this.instanceDoc = document.defaultView; // Reference to the document's window.

  // Attach various event listeners to the editable element.
  this.elm.addEvent('mousedown', this.selected.closureListener(this))
   .addEvent('keypress', this.keyDown.closureListener(this))
   .addEvent('focus', this.selected.closure(this))
   .addEvent('blur', this.blur.closure(this))
   .addEvent('keyup', this.selected.closure(this));

  this.ne.fireEvent('add', this); // Fire 'add' event for this instance.
 },

 // Removes the editor instance.
 remove : function()
 {
  this.saveContent(); // Save content back to original element.

  if ( this.copyElm || this.options.hasPanel )
  {
   this.editorContain.remove(); // Remove the editor container.
   this.e.setStyle({'display' : 'block'}); // Show the original element.
   this.ne.removePanel(); // Remove the panel.
  }
  this.disable(); // Disable contentEditable.
  this.ne.fireEvent('remove', this); // Fire 'remove' event.
 },

 // Disables the editor by making it non-editable.
 disable : function()
 {
  this.elm.setAttribute('contentEditable', 'false');
 },

 // Gets the current selection object (cross-browser).
 getSel : function()
 {
  return (window.getSelection) ? window.getSelection() : document.selection;
 },

 // Gets the current range object from the selection (cross-browser).
 getRng : function()
 {
  var s = this.getSel();
  if ( !s )
  {
   return null;
  }
  return (s.rangeCount > 0) ? s.getRangeAt(0) : s.createRange();
 },

 // Sets the selection to a given range (cross-browser).
 selRng : function(rng, s)
 {
  if ( window.getSelection )
  {
   s.removeAllRanges();
   s.addRange(rng);
  }
  else
  {
   rng.select();
  }
 },

 // Gets the selected element or the parent of the selection.
 selElm : function()
 {
  var r = this.getRng();
  if ( r.startContainer )
  {
   var contain = r.startContainer;
   // If a single node is selected, potentially return that node.
   if ( r.cloneContents().childNodes.length == 1 )
   {
    for ( var i = 0; i < contain.childNodes.length; i++ )
    {
     var rng = contain.childNodes[i].ownerDocument.createRange();
     rng.selectNode(contain.childNodes[i]);