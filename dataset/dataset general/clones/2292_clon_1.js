// --- Ext JS Library 2.0 - Cloned Version ---
// Copyright (c) 2006-2007, Ext JS, LLC. All rights reserved.
// For licensing details, please contact licensing@extjs.com
// More information available at: http://extjs.com/license

// This is a Type I clone of the original Ext.DomHelper module.
// It maintains exact logical and structural identity.
// Only whitespace and comments have been altered.

Ext.DomHelper = function() {
    // A temporary element used for table insertions, initialized on first use.
    var tempTableEl = null;

    // Regular expression to identify self-closing (empty) HTML tags.
    var emptyTags = /^(?:br|frame|hr|img|input|link|meta|range|spacer|wbr|area|param|col)$/i;

    // Regular expression to identify table-related tags.
    var tableRe = /^table|tbody|tr|td$/i;

    // --- Helper function to generate HTML markup from an object configuration ---
    var createHtml = function(o) {
        // If the input is already a string, return it directly.
        if (typeof o == 'string') {
            return o;
        }

        // Initialize the HTML string builder.
        var b = "";

        // Default tag to 'div' if not specified.
        if (!o.tag) {
            o.tag = "div";
        }

        // Start the opening tag.
        b += "<" + o.tag;

        // Iterate over object properties to add attributes.
        for (var attr in o) {
            // Skip internal properties or functions.
            if (attr == "tag" || attr == "children" || attr == "cn" || attr == "html" || typeof o[attr] == "function") continue;

            // Handle 'style' attribute specifically.
            if (attr == "style") {
                var s = o["style"];
                if (typeof s == "function") {
                    s = s.call(); // Execute function to get style string/object.
                }

                if (typeof s == "string") {
                    b += ' style="' + s + '"'; // Append string style directly.
                } else if (typeof s == "object") {
                    b += ' style="'; // Start building style string from object.
                    for (var key in s) {
                        if (typeof s[key] != "function") {
                            b += key + ":" + s[key] + ";"; // Add each style property.
                        }
                    }
                    b += '"'; // Close style attribute.
                }
            } else {
                // Handle 'cls' (class) attribute.
                if (attr == "cls") {
                    b += ' class="' + o["cls"] + '"';
                }
                // Handle 'htmlFor' attribute (for label elements).
                else if (attr == "htmlFor") {
                    b += ' for="' + o["htmlFor"] + '"';
                }
                // Generic attribute handling.
                else {
                    b += " " + attr + '="' + o[attr] + '"';
                }
            }
        }

        // Close the tag based on whether it's an empty tag or not.
        if (emptyTags.test(o.tag)) {
            b += "/>"; // Self-closing tag.
        } else {
            b += ">"; // Opening tag.

            // Process children (cn is an alias for children).
            var cn = o.children || o.cn;
            if (cn) {
                if (cn instanceof Array) {
                    // If children is an array, process each child recursively.
                    for (var i = 0, len = cn.length; i < len; i++) {
                        b += createHtml(cn[i], b); // Note: second argument 'b' is unused in createHtml.
                    }
                } else {
                    // If a single child, process it recursively.
                    b += createHtml(cn, b); // Note: second argument 'b' is unused in createHtml.
                }
            }

            // Add raw HTML content if provided.
            if (o.html) {
                b += o.html;
            }

            b += "</" + o.tag + ">"; // Closing tag.
        }
        return b; // Return the generated HTML string.
    };

    // --- Helper function to create DOM elements directly ---
    var createDom = function(o, parentNode) {
        // Create the element, defaulting to 'div'.
        var el = document.createElement(o.tag || 'div');

        // Check if setAttribute is available (IE compatibility).
        var useSet = el.setAttribute ? true : false;

        // Iterate over object properties to set attributes.
        for (var attr in o) {
            // Skip internal properties, functions, and style (handled separately).
            if (attr == "tag" || attr == "children" || attr == "cn" || attr == "html" || attr == "style" || typeof o[attr] == "function") continue;

            // Handle 'cls' (class) attribute.
            if (attr == "cls") {
                el.className = o["cls"];
            } else {
                // Set other attributes using setAttribute or direct property assignment.
                if (useSet) el.setAttribute(attr, o[attr]);
                else el[attr] = o[attr];
            }
        }

        // Apply styles using the DomHelper's own applyStyles method.
        Ext.DomHelper.applyStyles(el, o.style);

        // Process children (cn is an alias for children).
        var cn = o.children || o.cn;
        if (cn) {
            if (cn instanceof Array) {
                // If children is an array, create each child recursively and append.
                for (var i = 0, len = cn.length; i < len; i++) {
                    createDom(cn[i], el); // Recursively create and append child.
                }
            } else {
                // If a single child, create it recursively and append.
                createDom(cn, el);
            }
        }

        // Set innerHTML if provided.
        if (o.html) {
            el.innerHTML = o.html;
        }

        // Append the newly created element to the parent node if specified.
        if (parentNode) {
            parentNode.appendChild(el);
        }

        return el; // Return the created DOM element.
    };

    // --- Helper for IE table insertions ---
    var ieTable = function(depth, s, h, e) {
        // Set innerHTML on a temporary div.
        tempTableEl.innerHTML = [s, h, e].join('');
        var i = -1,
            el = tempTableEl;

        // Traverse down to the desired element based on depth.
        while (++i < depth) {
            el = el.firstChild;
        }
        return el; // Return the target element.
    };

    // --- Predefined HTML strings for table structure ---
    var ts = '<table>', // Table start
        te = '</table>', // Table end
        tbs = ts + '<tbody>', // Tbody start
        tbe = '</tbody>' + te, // Tbody end
        trs = tbs + '<tr>', // Tr start
        tre = '</tr>' + tbe; // Tr end

    // --- Function to handle inserting HTML into table elements for IE ---
    var insertIntoTable = function(tag, where, el, html) {
        // Initialize tempTableEl if it's null.
        if (!tempTableEl) {
            tempTableEl = document.createElement('div');
        }
        var node; // The node to be inserted.
        var before = null; // Reference node for insertion.

        // Logic based on the tag type and insertion position.
        if (tag == 'td') {
            // 'afterbegin' or 'beforeend' not supported for td.
            if (where == 'afterbegin' || where == 'beforeend') {
                return;
            }
            if (where == 'beforebegin') {
                before = el;
                el = el.parentNode; // Parent is tr.
            } else { // 'afterend'
                before = el.nextSibling;
                el = el.parentNode; // Parent is tr.
            }
            node = ieTable(4, trs, html, tre); // Create a tr with the html inside.
        } else if (tag == 'tr') {
            if (where == 'beforebegin') {
                before = el;
                el = el.parentNode; // Parent is tbody.
                node = ieTable(3, tbs, html, tbe); // Create a tbody with the html inside.
            } else if (where == 'afterend') {
                before = el.nextSibling;
                el = el.parentNode; // Parent is tbody.
                node = ieTable(3, tbs, html, tbe); // Create a tbody with the html inside.
            } else { // 'afterbegin' or 'beforeend'
                if (where == 'afterbegin') {
                    before = el.firstChild;
                }
                node = ieTable(4, trs, html, tre); // Create a tr with the html inside.
            }
        } else if (tag == 'tbody') {
            if (where == 'beforebegin') {
                before = el;
                el = el.parentNode; // Parent is table.
                node = ieTable(2, ts, html, te); // Create a table with the html inside.
            } else if (where == 'afterend') {
                before = el.nextSibling;
                el = el.parentNode; // Parent is table.
                node = ieTable(2, ts, html, te); // Create a table with the html inside.
            } else { // 'afterbegin' or 'beforeend'
                if (where == 'afterbegin') {
                    before = el.firstChild;
                }
                node = ieTable(3, tbs, html, tbe); // Create a tbody with the html inside.
            }
        } else { // For 'table' tag
            // 'beforebegin' or 'afterend' not supported for table element itself.
            if (where == 'beforebegin' || where == 'afterend') {
                return;
            }
            if (where == 'afterbegin') {
                before = el.firstChild;
            }
            node = ieTable(2, ts, html, te); // Create a table with the html inside.
        }

        // Insert the created node into the DOM.
        el.insertBefore(node, before);
        return node; // Return the inserted node.
    };

    // --- Public API for Ext.DomHelper ---
    return {
        // Flag to indicate whether to use direct DOM manipulation or HTML string.
        useDom: false,

        // Generates HTML markup from an object configuration.
        markup: function(o) {
            return createHtml(o);
        },

        // Applies CSS styles to an element.
        applyStyles: function(el, styles) {
            if (styles) {
                el = Ext.fly(el); // Ensure el is an Ext.Element.
                if (typeof styles == "string") {
                    // Parse style string (e.g., "color:red;font-size:12px;").
                    var re = /\s?([a-z\-]*)\:\s?([^;]*);?/gi;
                    var matches;
                    while ((matches = re.exec(styles)) != null) {
                        el.setStyle(matches[1], matches[2]);
                    }
                } else if (typeof styles == "object") {
                    // Apply styles from an object (e.g., {color:'red', fontSize:'12px'}).
                    for (var style in styles) {
                        el.setStyle(style, styles[style]);
                    }
                } else if (typeof styles == "function") {
                    // If styles is a function, execute it and apply results.
                    Ext.DomHelper.applyStyles(el, styles.call());
                }
            }
        },

        // Inserts HTML at a specified position relative to an element.
        insertHtml: function(where, el, html) {
            where = where.toLowerCase(); // Standardize insertion point.

            // Use insertAdjacentHTML for browsers that support it (primarily IE).
            if (el.insertAdjacentHTML) {
                // Special handling for table elements in IE.
                if (tableRe.test(el.tagName)) {
                    var rs;
                    if (rs = insertIntoTable(el.tagName.toLowerCase(), where, el, html)) {
                        return rs;
                    }
                }

                // Standard insertAdjacentHTML positions.
                switch (where) {
                    case "beforebegin":
                        el.insertAdjacentHTML('BeforeBegin', html);
                        return el.previousSibling;
                    case "afterbegin":
                        el.insertAdjacentHTML('AfterBegin', html);
                        return el.firstChild;
                    case "beforeend":
                        el.insertAdjacentHTML('BeforeEnd', html);
                        return el.lastChild;
                    case "afterend":
                        el.insertAdjacentHTML('AfterEnd', html);
                        return el.nextSibling;
                }
                // Should not reach here if 'where' is valid.
                throw 'Illegal insertion point -> "' + where + '"';
            }

            // Fallback for other browsers using DOM Range and DocumentFragment.
            var range = el.ownerDocument.createRange();
            var frag; // DocumentFragment to hold parsed HTML.

            switch (where) {
                case "beforebegin":
                    range.setStartBefore(el);
                    frag = range.createContextualFragment(html);
                    el.parentNode.insertBefore(frag, el);
                    return el.previousSibling;
                case "afterbegin":
                    if (el.firstChild) {
                        range.setStartBefore(el.firstChild);
                        frag = range.createContextualFragment(html);
                        el.insertBefore(frag, el.firstChild);
                        return el.firstChild;
                    } else {
                        el.innerHTML = html; // If no children, just set innerHTML.
                        return el.firstChild;
                    }
                case "beforeend":
                    if (el.lastChild) {
                        range.setStartAfter(el.lastChild);
                        frag = range.createContextualFragment(html);
                        el.appendChild(frag);
                        return el.lastChild;
                    } else {
                        el.innerHTML = html; // If no children, just set innerHTML.
                        return el.lastChild;
                    }
                case "afterend":
                    range.setStartAfter(el);
                    frag = range.createContextualFragment(html);
                    el.parentNode.insertBefore(frag, el.nextSibling);
                    return el.nextSibling;
            }
            // Should not reach here if 'where' is valid.
            throw 'Illegal insertion point -> "' + where + '"';
        },

        // Inserts a new element (or HTML) before the specified element.
        insertBefore: function(el, o, returnElement) {
            return this.doInsert(el, o, returnElement, "beforeBegin");
        },

        // Inserts a new element (or HTML) after the specified element.
        insertAfter: function(el, o, returnElement) {
            return this.doInsert(el, o, returnElement, "afterEnd", "nextSibling");
        },

        // Inserts a new element (or HTML) as the first child of the specified element.
        insertFirst: function(el, o, returnElement) {
            return this.doInsert(el, o, returnElement, "afterBegin", "firstChild");
        },

        // Core insertion logic, handles both DOM and HTML string creation.
        doInsert: function(el, o, returnElement, pos, sibling) {
            el = Ext.getDom(el); // Ensure 'el' is a DOM element.
            var newNode;

            if (this.useDom) {
                newNode = createDom(o, null); // Create DOM element without appending.
                // Insert the new node:
                // If 'sibling' is 'firstChild', insert before the element's first child.
                // Otherwise, if 'sibling' is provided, insert before el[sibling].
                // If no 'sibling', insert before 'el' itself.
                (sibling === "firstChild" ? el : el.parentNode).insertBefore(newNode, sibling ? el[sibling] : el);
            } else {
                var html = createHtml(o); // Generate HTML string.
                newNode = this.insertHtml(pos, el, html); // Insert HTML.
            }
            // Return Ext.Element if returnElement is true, otherwise raw DOM node.
            return returnElement ? Ext.get(newNode, true) : newNode;
        },

        // Appends a new element (or HTML) as the last child of the specified element.
        append: function(el, o, returnElement) {
            el = Ext.getDom(el); // Ensure 'el' is a DOM element.
            var newNode;

            if (this.useDom) {
                newNode = createDom(o, null); // Create DOM element.
                el.appendChild(newNode); // Append directly.
            } else {
                var html = createHtml(o); // Generate HTML string.
                newNode = this.insertHtml("beforeEnd", el, html); // Insert HTML at 'beforeend'.
            }
            // Return Ext.Element if returnElement is true, otherwise raw DOM node.
            return returnElement ? Ext.get(newNode, true) : newNode;
        },

        // Overwrites the content of an element with new HTML.
        overwrite: function(el, o, returnElement) {
            el = Ext.getDom(el); // Ensure 'el' is a DOM element.
            el.innerHTML = createHtml(o); // Replace innerHTML with new content.
            // Return Ext.Element wrapping the first child, or the raw first child.
            return returnElement ? Ext.get(el.firstChild, true) : el.firstChild;
        },

        // Creates an Ext.Template instance from an object configuration.
        createTemplate: function(o) {
            var html = createHtml(o); // Generate HTML from config.
            return new Ext.Template(html); // Return a new Template.
        }
    };
}(); // Execute immediately to create the singleton.

// --- Ext.Template Class Definition ---
Ext.Template = function(html) {
    var a = arguments; // Store arguments locally.
    if (html instanceof Array) {
        html = html.join(""); // If array, join to form a single HTML string.
    } else if (a.length > 1) {
        // If multiple arguments, collect strings and apply objects to 'this'.
        var buf = [];
        for (var i = 0, len = a.length; i < len; i++) {
            if (typeof a[i] == 'object') {
                Ext.apply(this, a[i]); // Apply object properties to template instance.
            } else {
                buf[buf.length] = a[i]; // Collect string parts.
            }
        }
        html = buf.join(''); // Join string parts.
    }

    this.html = html; // Store the final HTML string.
    if (this.compiled) {
        this.compile(); // If 'compiled' is true, compile the template immediately.
    }
};

// --- Ext.Template Prototype Methods ---
Ext.Template.prototype = {
    // Applies values to the template to generate a final string.
    applyTemplate: function(values) {
        if (this.compiled) {
            return this.compiled(values); // Use compiled function if available.
        }

        var useF = this.disableFormats !== true; // Check if formatting is enabled.
        var fm = Ext.util.Format,
            tpl = this; // Cache references.

        // The replacer function for the regular expression.
        var fn = function(m, name, format, args) {
            // If a format is specified and formatting is enabled.
            if (format && useF) {
                if (format.substr(0, 5) == "this.") {
                    // Call a method on the template instance if format starts with "this.".
                    return tpl.call(format.substr(5), values[name], values);
                } else {
                    // Apply a global Ext.util.Format function.
                    if (args) {
                        // Parse arguments string (e.g., "'foo',123").
                        // Regex to remove quotes around string arguments.
                        var re = /^\s*['"](.*)["']\s*$/;
                        args = args.split(',');
                        for (var i = 0, len = args.length; i < len; i++) {
                            args[i] = args[i].replace(re, "$1");
                        }
                        // Prepend the value to the arguments array.
                        args = [values[name]].concat(args);
                    } else {
                        args = [values[name]]; // Just the value if no other args.
                    }
                    return fm[format].apply(fm, args); // Apply the formatter.
                }
            } else {
                // If no format, return the value or an empty string if undefined.
                return values[name] !== undefined ? values[name] : "";
            }
        };
        // Replace placeholders using the regex and the replacer function.
        return this.html.replace(this.re, fn);
    },

    // Sets new HTML for the template and optionally recompiles it.
    set: function(html, compile) {
        this.html = html; // Update HTML.
        this.compiled = null; // Clear compiled function.
        if (compile) {
            this.compile(); // Recompile if requested.
        }
        return this; // Allow chaining.
    },

    // Property to disable automatic formatting.
    disableFormats: false,

    // Regular expression for template placeholders: {name:format(args)}.
    re: /\{([\w-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g,

    // Compiles the template into a reusable function for faster rendering.
    compile: function() {
        var fm = Ext.util.Format; // Reference to format utility.
        var useF = this.disableFormats !== true; // Check if formatting is enabled.
        var sep = Ext.isGecko ? "+" : ","; // Concatenation operator for string building.

        // Replacer function used during compilation.
        var fn = function(m, name, format, args) {
            if (format && useF) {
                args = args ? ',' + args : ""; // Prepare arguments for the compiled function.
                if (format.substr(0, 5) != "this.") {
                    // Call a global Ext.util.Format function.
                    format = "fm." + format + '(';
                } else {
                    // Call a method on the template instance.
                    format = 'this.call("' + format.substr(5) + '", ';
                    args = ", values"; // Pass all values if calling a template method.
                }
            } else {
                // If no format, handle undefined values.
                args = '';
                format = "(values['" + name + "'] == undefined ? '' : ";
            }
            // Return a string fragment for the compiled function's body.
            return "'" + sep + format + "values['" + name + "']" + args + ")" + sep + "'";
        };

        var body; // Variable to hold the generated function body.

        // Gecko (Firefox) handles string concatenation with '+' more efficiently.
        if (Ext.isGecko) {
            body = "this.compiled = function(values){ return '" +
                this.html.replace(/\\/g, '\\\\').replace(/(\r\n|\n)/g, '\\n').replace(/'/g, "\\'").replace(this.re, fn) +
                "';};";
        } else {
            // Other browsers often perform better with array join for string building.
            body = ["this.compiled = function(values){ return ['"];
            body.push(this.html.replace(/\\/g, '\\\\').replace(/(\r\n|\n)/g, '\\n').replace(/'/g, "\\'").replace(this.re, fn));
            body.push("'].join('');};");
            body = body.join('');
        }
        eval(body); // Execute the generated function string to create 'this.compiled'.
        return this; // Allow chaining.
    },

    // Calls a method on the template instance.
    call: function(fnName, value, allValues) {
        return this[fnName](value, allValues);
    },

    // Inserts the template's output as the first child of an element.
    insertFirst: function(el, values, returnElement) {
        return this.doInsert('afterBegin', el, values, returnElement);
    },

    // Inserts the template's output before an element.
    insertBefore: function(el, values, returnElement) {
        return this.doInsert('beforeBegin', el, values, returnElement);
    },

    // Inserts the template's output after an element.
    insertAfter: function(el, values, returnElement) {
        return this.doInsert('afterEnd', el, values, returnElement);
    },

    // Appends the template's output as the last child of an element.
    append: function(el, values, returnElement) {
        return this.doInsert('beforeEnd', el, values, returnElement);
    },

    // Core insertion logic for template output.
    doInsert: function(where, el, values, returnEl) {
        el = Ext.getDom(el); // Get the DOM element.
        var newNode = Ext.DomHelper.insertHtml(where, el, this.applyTemplate(values)); // Insert rendered HTML.
        // Return Ext.Element if returnEl is true, otherwise raw DOM node.
        return returnEl ? Ext.get(newNode, true) : newNode;
    },

    // Overwrites the content of an element with the template's output.
    overwrite: function(el, values, returnElement) {
        el = Ext.getDom(el); // Get the DOM element.
        el.innerHTML = this.applyTemplate(values); // Replace innerHTML.
        // Return Ext.Element wrapping the first child, or the raw first child.
        return returnElement ? Ext.get(el.firstChild, true) : el.firstChild;
    }
};

// Alias apply to applyTemplate for compatibility.
Ext.Template.prototype.apply = Ext.Template.prototype.applyTemplate;

// Add Ext.Template as a property of Ext.DomHelper for convenience.
Ext.DomHelper.Template = Ext.Template;

// Static method to create a template from an existing DOM element's value or innerHTML.
Ext.Template.from = function(el, config) {
    el = Ext.getDom(el); // Get the DOM element.
    // Create a new Template using the element's value (for input/textarea) or innerHTML.
    return new Ext.Template(el.value || el.innerHTML, config || '');
};

// --- Ext.DomQuery (start of next module) ---
// This line marks the beginning of another module, left as-is per instructions.
Ext.DomQuery = function() {
    // Content of Ext.DomQuery would follow here.
};