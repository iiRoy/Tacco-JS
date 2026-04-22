MediumEditor=function(elements,options){
    'use strict';/* Strict mode enabled */
  return  this.init(elements,options);
};/* End of MediumEditor global function definition */



if(typeof module==='object'){
 module.exports=MediumEditor; // Export for CommonJS environments
}



(function(window,document){
 'use strict';// Ensure strict mode within the IIFE


    /* Helper function to extend properties from one object to another */
    function extend(b,a){
        var prop; // Declare property iterator
        if(b===undefined){
            return a;
        }/* If base object 'b' is undefined, return 'a' directly */
        for(prop in a){
            // Check if property exists on 'a' and not on 'b'
            if(a.hasOwnProperty(prop) && b.hasOwnProperty(prop)===false){
                b[prop]=a[prop];
            }
        }
        return b;
    }


    /**
     * @function saveSelection
     * @description Saves the current text selection in the document.
     * @see http://stackoverflow.com/questions/5605401/insert-link-in-contenteditable-element
     * @author Tim Down
     * @returns {Array|null} An array of Range objects if a selection exists, otherwise null.
     */
    function saveSelection(){
        var i,
            len,
            ranges,
            sel=window.getSelection(); // Get the current selection object
        if(sel.getRangeAt && sel.rangeCount){
            ranges=[];// Initialize an empty array for ranges
            for(i=0,len=sel.rangeCount;i<len;i+=1){
                ranges.push(sel.getRangeAt(i));
            }
            return ranges;
        }
        return null; // No selection or range found
    }


    /**
     * @function restoreSelection
     * @description Restores a previously saved selection.
     * @param {Array} savedSel An array of Range objects previously saved by saveSelection().
     */
    function restoreSelection(savedSel){
        var i,
            len,
            sel=window.getSelection(); // Get the current selection object
        if(savedSel){
            sel.removeAllRanges();// Clear all existing ranges
            for(i=0,len=savedSel.length;i<len;i+=1){
                sel.addRange(savedSel[i]); // Add each saved range back
            }
        }
    }


    /**
     * @function getSelectionStart
     * @description Retrieves the starting HTML element of the current selection.
     * @see http://stackoverflow.com/questions/1197401/how-can-i-get-the-element-the-caret-is-in-with-javascript-when-using-contentedi
     * @author You
     * @returns {HTMLElement|null} The starting element or null if no selection.
     */
    function getSelectionStart(){
        var node=document.getSelection().anchorNode,
            startNode=(node && node.nodeType===3 ? node.parentNode : node);
        return startNode;
    }


    /**
     * @function getSelectionHtml
     * @description Gets the HTML content of the current selection.
     * @see http://stackoverflow.com/questions/4176923/html-of-selected-text
     * @author Tim Down
     * @returns {string} The HTML string of the selected content.
     */
    function getSelectionHtml(){
        var i,
            html='',
            sel,
            len,
            container;
        if(window.getSelection!==undefined){
            sel=window.getSelection();
            if(sel.rangeCount){
                container=document.createElement('div');
                for(i=0,len=sel.rangeCount;i<len;i+=1){
                    container.appendChild(sel.getRangeAt(i).cloneContents());
                }
                html=container.innerHTML;
            }
        }else if(document.selection!==undefined){
            if(document.selection.type==='Text'){
                html=document.selection.createRange().htmlText;
            }
        }
        return html;
    }


    /**
     * @function isElement
     * @description Checks if the given object is an HTMLElement.
     * @see https://github.com/jashkenas/underscore
     * @param {any} obj The object to check.
     * @returns {boolean} True if the object is an element, false otherwise.
     */
    function isElement(obj){
        return !!(obj && obj.nodeType===1);
    }


    // MediumEditor prototype definition starts here
    MediumEditor.prototype={
        defaults:{
            allowMultiParagraphSelection:true,
            anchorInputPlaceholder:'Paste or type a link',
            anchorPreviewHideDelay:500,
            buttons:['bold','italic','underline','anchor','header1','header2','quote'],
            buttonLabels:false,
            checkLinkFormat:false,
            cleanPastedHTML:false,
            delay:0,
            diffLeft:0,
            diffTop:-10,
            disableReturn:false,
            disableDoubleReturn:false,
            disableToolbar:false,
            firstHeader:'h3',
            forcePlainText:true,
            placeholder:'Type your text',
            secondHeader:'h4',
            targetBlank:false,
            extensions:{}
        },

        /*
         * Determines if the current browser is Internet Explorer.
         * Source: http://stackoverflow.com/questions/17907445/how-to-detect-ie11#comment30165888_17907562
         * By rg89
         */
        isIE:((navigator.appName==='Microsoft Internet Explorer')||((navigator.appName==='Netscape')&&(new RegExp('Trident/.*rv:([0-9]{1,}[.0-9]{0,})').exec(navigator.userAgent)!==null))),

        /**
         * Initializes the MediumEditor instance.
         * @param {string|HTMLElement|NodeList} elements Elements to make editable.
         * @param {object} options Configuration options.
         * @returns {MediumEditor} The current MediumEditor instance.
         */
        init:function(elements,options){
            this.setElementSelection(elements); // Set the elements for this instance
            if(this.elements.length===0){
                return; // No elements to initialize
            }
            this.parentElements=['p','h1','h2','h3','h4','h5','h6','blockquote','pre'];
            this.id=document.querySelectorAll('.medium-editor-toolbar').length+1; // Unique ID for toolbar
            this.options=extend(options,this.defaults); // Merge options with defaults
            return this.setup(); // Proceed to setup
        },

        /**
         * Performs initial setup steps for the editor.
         * @returns {MediumEditor} The current MediumEditor instance.
         */
        setup:function(){
            this.isActive=true; // Mark editor as active
            this.initElements()
                .bindSelect()
                .bindPaste()
                .setPlaceholders()
                .bindWindowActions(); // Chain initialization methods
        },

        /**
         * Initializes editable elements and binds necessary events.
         * @returns {MediumEditor} The current MediumEditor instance.
         */
        initElements:function(){
            this.updateElementList(); // Refresh the list of elements
            var i,
                addToolbar=false; // Flag to determine if toolbar should be added
            for(i=0;i<this.elements.length;i+=1){
                this.elements[i].setAttribute('contentEditable',true); // Make element editable
                if(!this.elements[i].getAttribute('data-placeholder')){
                    this.elements[i].setAttribute('data-placeholder',this.options.placeholder); // Set placeholder if not exists
                }
                this.elements[i].setAttribute('data-medium-element',true); // Mark as a MediumEditor element
                this.bindParagraphCreation(i).bindReturn(i).bindTab(i); // Bind keyboard events
                if(!this.options.disableToolbar && !this.elements[i].getAttribute('data-disable-toolbar')){
                    addToolbar=true; // Toolbar needed if not disabled globally or on element
                }
            }
            // Initialize toolbar if needed
            if(addToolbar){
                this.initToolbar()
                    .bindButtons()
                    .bindAnchorForm()
                    .bindAnchorPreview(); // Chain toolbar initialization
            }
            return this;
        },

        /**
         * Sets the elements that MediumEditor will manage.
         * @param {string|HTMLElement|NodeList} selector The selector, element, or NodeList.
         */
        setElementSelection:function(selector){
            this.elementSelection=selector;
            this.updateElementList(); // Update the internal list of elements
        },

        /**
         * Updates the internal list of editable elements based on the current selection.
         */
        updateElementList:function(){
            this.elements=typeof this.elementSelection==='string' ? document.querySelectorAll(this.elementSelection) : this.elementSelection;
            // If it's a single element, wrap it in an array for consistency
            if(this.elements.nodeType===1){
                this.elements=[this.elements];
            }
        },

        /**
         * Serializes the content of all managed elements.
         * @returns {object} An object where keys are element IDs and values are their trimmed HTML content.
         */
        serialize:function(){
            var i,
                elementid,
                content={}; // Object to store serialized content
            for(i=0;i<this.elements.length;i+=1){
                elementid=(this.elements[i].id!=='') ? this.elements[i].id : 'element-'+i; // Get or generate ID
                content[elementid]={
                    value:this.elements[i].innerHTML.trim() // Store trimmed inner HTML
                };
            }
            return content;
        },

        /**
         * Helper function to call a method with a number of parameters on all registered extensions.
         * The function assures that the function exists before calling.
         *
         * @param {string} funcName name of the function to call
         * @param [args] arguments passed into funcName
         */
        callExtensions:function(funcName){
            if(arguments.length<1){
                return; // No function name provided
            }

            var args=Array.prototype.slice.call(arguments,1), // Get arguments after funcName
                ext,
                name;

            for(name in this.options.extensions){
                if(this.options.extensions.hasOwnProperty(name)){
                    ext=this.options.extensions[name];
                    if(ext[funcName]!==undefined){
                        ext[funcName].apply(ext,args); // Call the extension method
                    }
                }
            }
        },

        /**
         * Binds keyup event to handle paragraph creation logic.
         * @param {number} index Index of the element in the elements array.
         * @returns {MediumEditor} The current MediumEditor instance.
         */
        bindParagraphCreation:function(index){
            var self=this; // Store reference to 'this'
            this.elements[index].addEventListener('keyup',function(e){
                var node=getSelectionStart(),
                    tagName;
                // If element is empty and allows returns, format as paragraph
                if(node && node.getAttribute('data-medium-element') && node.children.length===0 && !(self.options.disableReturn||node.getAttribute('data-disable-return'))){
                    document.execCommand('formatBlock',false,'p');
                }
                if(e.which===13){ // Enter key pressed
                    node=getSelectionStart();
                    tagName=node.tagName.toLowerCase();
                    // Handle paragraph creation and unlink 'a' tags on enter
                    if(!(self.options.disableReturn||this.getAttribute('data-disable-return'))&&
                        tagName!=='li'&&!self.isListItemChild(node)){
                        if(!e.shiftKey){
                            document.execCommand('formatBlock',false,'p');
                        }
                        if(tagName==='a'){
                            document.execCommand('unlink',false,null);
                        }
                    }
                }
            });
            return this;
        },

        /**
         * Checks if a given node is a child of an <li> element within the editable area.
         * @param {HTMLElement} node The node to check.
         * @returns {boolean} True if it's a list item child, false otherwise.
         */
        isListItemChild:function(node){
            var parentNode=node.parentNode,
                tagName=parentNode.tagName.toLowerCase();
            while(this.parentElements.indexOf(tagName)===-1 && tagName!=='div'){
                if(tagName==='li'){
                    return true;
                }
                parentNode=parentNode.parentNode;
                if(parentNode && parentNode.tagName){
                    tagName=parentNode.tagName.toLowerCase();
                }else{
                    return false; // Reached document root or invalid parent
                }
            }
            return false;
        },

        /**
         * Binds keypress event to handle return key behavior.
         * @param {number} index Index of the element.
         * @returns {MediumEditor} The current MediumEditor instance.
         */
        bindReturn:function(index){
            var self=this;
            this.elements[index].addEventListener('keypress',function(e){
                if(e.which===13){ // Enter key
                    if(self.options.disableReturn||this.getAttribute('data-disable-return')){
                        e.preventDefault(); // Prevent default return behavior
                    }else if(self.options.disableDoubleReturn||this.getAttribute('data-disable-double-return')){
                        var node=getSelectionStart();
                        if(node && node.innerText==='\n'){
                            e.preventDefault(); // Prevent double return
                        }
                    }
                }
            });
            return this;
        },

        /**
         * Binds keydown event to handle tab key behavior, specifically for 'pre' tags.
         * @param {number} index Index of the element.
         * @returns {MediumEditor} The current MediumEditor instance.
         */
        bindTab:function(index){
            this.elements[index].addEventListener('keydown',function(e){
                if(e.which===9){ // Tab key
                    // Override tab only for preformatted text nodes
                    var tag=getSelectionStart().tagName.toLowerCase();
                    if(tag==='pre'){
                        e.preventDefault(); // Prevent default tab action
                        document.execCommand('insertHtml',null,'    '); // Insert 4 spaces
                    }
                }
            });
            return this;
        },

        /**
         * Generates the HTML for a specific button type.
         * @param {string} btnType The type of button to generate (e.g., 'bold', 'italic').
         * @returns {string|boolean} The HTML string for the button, or false if not found.
         */
        buttonTemplate:function(btnType){
            var buttonLabels=this.getButtonLabels(this.options.buttonLabels),
                buttonTemplates={
                    'bold':'<button class="medium-editor-action medium-editor-action-bold" data-action="bold" data-element="b">'+buttonLabels.bold+'</button>',
                    'italic':'<button class="medium-editor-action medium-editor-action-italic" data-action="italic" data-element="i">'+buttonLabels.italic+'</button>',
                    'underline':'<button class="medium-editor-action medium-editor-action-underline" data-action="underline" data-element="u">'+buttonLabels.underline+'</button>',
                    'strikethrough':'<button class="medium-editor-action medium-editor-action-strikethrough" data-action="strikethrough" data-element="strike"><strike>A</strike></button>',
                    'superscript':'<button class="medium-editor-action medium-editor-action-superscript" data-action="superscript" data-element="sup">'+buttonLabels.superscript+'</button>',
                    'subscript':'<button class="medium-editor-action medium-editor-action-subscript" data-action="subscript" data-element="sub">'+buttonLabels.subscript+'</button>',
                    'anchor':'<button class="medium-editor-action medium-editor-action-anchor" data-action="anchor" data-element="a">'+buttonLabels.anchor+'</button>',
                    'image':'<button class="medium-editor-action medium-editor-action-image" data-action="image" data-element="img">'+buttonLabels.image+'</button>',
                    'header1':'<button class="medium-editor-action medium-editor-action-header1" data-action="append-'+this.options.firstHeader+'" data-element="'+this.options.firstHeader+'">'+buttonLabels.header1+'</button>',
                    'header2':'<button class="medium-editor-action medium-editor-action-header2" data-action="append-'+this.options.secondHeader+'" data-element="'+this.options.secondHeader+'">'+buttonLabels.header2+'</button>',
                    'quote':'<button class="medium-editor-action medium-editor-action-quote" data-action="append-blockquote" data-element="blockquote">'+buttonLabels.quote+'</button>',
                    'orderedlist':'<button class="medium-editor-action medium-editor-action-orderedlist" data-action="insertorderedlist" data-element="ol">'+buttonLabels.orderedlist+'</button>',
                    'unorderedlist':'<button class="medium-editor-action medium-editor-action-unorderedlist" data-action="insertunorderedlist" data-element="ul">'+buttonLabels.unorderedlist+'</button>',
                    'pre':'<button class="medium-editor-action medium-editor-action-pre" data-action="append-pre" data-element="pre">'+buttonLabels.pre+'</button>',
                    'indent':'<button class="medium-editor-action medium-editor-action-indent" data-action="indent" data-element="ul">'+buttonLabels.indent+'</button>',
                    'outdent':'<button class="medium-editor-action medium-editor-action-outdent" data-action="outdent" data-element="ul">'+buttonLabels.outdent+'</button>'
                };
            return buttonTemplates[btnType]||false;
        },

        // TODO: This method could potentially be broken down into smaller, more focused functions.
        /**
         * Retrieves the button labels based on the specified type.
         * @param {string|object} buttonLabelType The type of labels ('fontawesome', or a custom object).
         * @returns {object} An object containing button labels.
         */
        getButtonLabels:function(buttonLabelType){
            var customButtonLabels,
                attrname,
                buttonLabels={ // Default button labels
                    'bold':'<b>B</b>',
                    'italic':'<b><i>I</i></b>',
                    'underline':'<b><u>U</u></b>',
                    'superscript':'<b>x<sup>1</sup></b>',
                    'subscript':'<b>x<sub>1</sub></b>',
                    'anchor':'<b>#</b>',
                    'image':'<b>image</b>',
                    'header1':'<b>H1</b>',
                    'header2':'<b>H2</b>',
                    'quote':'<b>&ldquo;</b>',
                    'orderedlist':'<b>1.</b>',
                    'unorderedlist':'<b>&bull;</b>',
                    'pre':'<b>0101</b>',
                    'indent':'<b>&rarr;</b>',
                    'outdent':'<b>&larr;</b>'
                };
            if(buttonLabelType==='fontawesome'){
                customButtonLabels={ // Font Awesome icons
                    'bold':'<i class="fa fa-bold"></i>',
                    'italic':'<i class="fa fa-italic"></i>',
                    'underline':'<i class="fa fa-underline"></i>',
                    'superscript':'<i class="fa fa-superscript"></i>',
                    'subscript':'<i class="fa fa-subscript"></i>',
                    'anchor':'<i class="fa fa-link"></i>',
                    'image':'<i class="fa fa-picture-o"></i>',
                    'quote':'<i class="fa fa-quote-right"></i>',
                    'orderedlist':'<i class="fa fa-list-ol"></i>',
                    'unorderedlist':'<i class="fa fa-list-ul"></i>',
                    'pre':'<i class="fa fa-code fa-lg"></i>',
                    'indent':'<i class="fa fa-indent"></i>',
                    'outdent':'<i class="fa fa-outdent"></i>'
                };
            }else if(typeof buttonLabelType==='object'){
                customButtonLabels=buttonLabelType; // Use provided custom object
            }
            if(typeof customButtonLabels==='object'){
                for(attrname in customButtonLabels){
                    if(customButtonLabels.hasOwnProperty(attrname)){
                        buttonLabels[attrname]=customButtonLabels[attrname]; // Override default labels
                    }
                }
            }
            return buttonLabels;
        },

        /**
         * Initializes the editor toolbar.
         * @returns {MediumEditor} The current MediumEditor instance.
         */
        initToolbar:function(){
            if(this.toolbar){
                return this; // Toolbar already initialized
            }
            this.toolbar=this.createToolbar(); // Create the toolbar element
            this.keepToolbarAlive=false; // Initial state for toolbar visibility
            this.anchorForm=this.toolbar.querySelector('.medium-editor-toolbar-form-anchor');
            this.anchorInput=this.anchorForm.querySelector('input');
            this.toolbarActions=this.toolbar.querySelector('.medium-editor-toolbar-actions');
            this.anchorPreview=this.createAnchorPreview(); // Create the anchor preview element

            return this;
        },

        /**
         * Creates and appends the main toolbar element to the document body.
         * @returns {HTMLElement} The created toolbar element.
         */
        createToolbar:function(){
            var toolbar=document.createElement('div');
            toolbar.id='medium-editor-toolbar-'+this.id; // Assign unique ID
            toolbar.className='medium-editor-toolbar'; // Assign CSS class
            toolbar.appendChild(this.toolbarButtons()); // Add button list
            toolbar.appendChild(this.toolbarFormAnchor()); // Add anchor form
            document.body.appendChild(toolbar); // Append to document body
            return toolbar;
        },

        //TODO: Consider adding an actionTemplate method for more modular button creation.
        /**
         * Creates the list of toolbar buttons.
         * @returns {HTMLUListElement} The unordered list element containing the buttons.
         */
        toolbarButtons:function(){
            var btns=this.options.buttons,
                ul=document.createElement('ul'),
                li,
                i,
                btn,
                ext;

            ul.id='medium-editor-toolbar-actions';
            ul.className='medium-editor-toolbar-actions clearfix';

            for(i=0;i<btns.length;i+=1){
                // Check if button type corresponds to an extension
                if(this.options.extensions.hasOwnProperty(btns[i])){
                    ext=this.options.extensions[btns[i]];
                    btn=ext.getButton!==undefined ? ext.getButton() : null; // Get button from extension
                }else{
                    btn=this.buttonTemplate(btns[i]); // Use default template
                }

                if(btn){
                    li=document.createElement('li');
                    if(isElement(btn)){
                        li.appendChild(btn); // Append if it's an element
                    }else{
                        li.innerHTML=btn; // Set innerHTML if it's a string
                    }
                    ul.appendChild(li); // Add list item to the unordered list
                }
            }

            return ul;
        },

        /**
         * Creates the anchor input form for the toolbar.
         * @returns {HTMLElement} The div element containing the anchor form.
         */
        toolbarFormAnchor:function(){
            var anchor=document.createElement('div'),
                input=document.createElement('input'),
                a=document.createElement('a');

            a.setAttribute('href','#');
            a.innerHTML='&times;'; // Close icon

            input.setAttribute('type','text');
            input.setAttribute('placeholder',this.options.anchorInputPlaceholder);

            anchor.className='medium-editor-toolbar-form-anchor';
            anchor.id='medium-editor-toolbar-form-anchor';
            anchor.appendChild(input);
            anchor.appendChild(a);

            return anchor;
        },

        /**
         * Binds selection-related events to elements and the document.
         * @returns {MediumEditor} The current MediumEditor instance.
         */
        bindSelect:function(){
            var self=this,
                timer='',
                i;

            this.checkSelectionWrapper=function(e){

                // Do not close the toolbar when bluring the editable area and clicking into the anchor form
                if(e && self.clickingIntoArchorForm(e)){
                    return false;
                }

                clearTimeout(timer); // Clear previous timeout
                timer=setTimeout(function(){
                    self.checkSelection(); // Check selection after a delay
                },self.options.delay);
            };

            document.documentElement.addEventListener('mouseup',this.checkSelectionWrapper); // Global mouseup listener

            for(i=0;i<this.elements.length;i+=1){
                this.elements[i].addEventListener('keyup',this.checkSelectionWrapper); // Keyup on editable elements
                this.elements[i].addEventListener('blur',this.checkSelectionWrapper); // Blur on editable elements
            }
            return this;
        },

        /**
         * Checks the current selection and updates the toolbar visibility accordingly.
         * @returns {MediumEditor} The current MediumEditor instance.
         */
        checkSelection:function(){
            var newSelection,
                selectionElement;

            if(this.keepToolbarAlive!==true && !this.options.disableToolbar){
                newSelection=window.getSelection();
                if(newSelection.toString().trim()===''||
                    (this.options.allowMultiParagraphSelection===false && this.hasMultiParagraphs())){
                    this.hideToolbarActions(); // Hide toolbar if selection is empty or multi-paragraph not allowed
                }else{
                    selectionElement=this.getSelectionElement();
                    if(!selectionElement || selectionElement.getAttribute('data-disable-toolbar')){
                        this.hideToolbarActions(); // Hide if element disables toolbar
                    }else{
                        this.checkSelectionElement(newSelection,selectionElement); // Check selection on the element
                    }
                }
            }
            return this;
        },

        /**
         * Determines if an event represents clicking into the anchor form.
         * @param {Event} e The event object.
         * @returns {boolean} True if clicking into anchor form, false otherwise.
         */
        clickingIntoArchorForm:function(e){
            var self=this;
            // Check if it's a blur event and related target is the anchor input
            if(e.type && e.type.toLowerCase()==='blur' && e.relatedTarget && e.relatedTarget===self.anchorInput){
                return true;
            }
            return false;
        },

        /**
         * Checks if the current selection spans multiple paragraphs or block-level elements.
         * @returns {number} The count of block-level elements in the selection, or 0.
         */
        hasMultiParagraphs:function(){
            var selectionHtml=getSelectionHtml().replace(/<[\S]+><\/[\S]+>/gim,''), // Get selection HTML, clean empty tags
                hasMultiParagraphs=selectionHtml.match(/<(p|h[0-6]|blockquote)>([\s\S]*?)<\/(p|h[0-6]|blockquote)>/g); // Match block tags

            return (hasMultiParagraphs ? hasMultiParagraphs.length : 0);
        }
    };

})(window,document);