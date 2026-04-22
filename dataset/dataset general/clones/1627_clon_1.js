'use strict';


angular .module ( 'JSONedit', [ 'ui.sortable' ] )

// This directive overrides the default behavior of ngModel for input fields.
// It forces the model to update on 'blur' event rather than 'input' or 'change'.
// This is particularly useful for text inputs where immediate updates might be undesirable.
.directive ( 'ngModelOnblur' , function ( ) {

    // override the default input to update on blur
    // This technique is adapted from a solution found on jsFiddle.
    // Reference: http://jsfiddle.net/cn8VF/
    return {
        restrict: 'A', // Restrict this directive to be used as an attribute.
        require : 'ngModel', // This directive requires ngModel controller.
        link : function ( scope , elm , attr , ngModelCtrl ) {

            // If the input type is radio or checkbox, we don't apply this behavior
            // as their update logic is typically handled differently.
            if ( attr.type === 'radio' || attr.type === 'checkbox' )
            {
                return ;
            }

            // Unbind default Angular input events to prevent premature model updates.
            elm. unbind ( 'input' ) . unbind ( 'keydown' ) . unbind ( 'change' ) ;

            // Bind the 'blur' event to update the model.
            elm. bind ( 'blur' , function ( ) {
                // Use $apply to ensure Angular's digest cycle runs and updates the view.
                scope. $apply ( function ( ) {
                    ngModelCtrl. $setViewValue ( elm.val ( ) ) ;
                } ) ;
            } ) ; // End of blur event binding.
        } // End of link function.
    } ; // End of return object.
} ) // End of ngModelOnblur directive.

/*
 * The 'json' directive is responsible for rendering and editing JSON data
 * within the HTML structure. It provides functionality for collapsing/expanding
 * objects/arrays, adding new items, deleting items, and changing item values.
 */
.directive ( 'json' , [ "$compile" , function ( $compile ) {

  return {
    restrict : 'E' , // This directive can only be used as an element (e.g., <json>).
    scope : { // Define an isolated scope for this directive.
      child : '=' , // Two-way data binding for the JSON data.
      type : '@' , // One-way string binding for the type (object or array).
      defaultCollapsed : '=' // Two-way binding for initial collapsed state.
    } , // End of scope definition.

    link : function ( scope , element , attributes ) {

        // --- Constant String Definitions for Type Names ---
        var stringName = "Text" ;
        var objectName = "Object" ;
        var arrayName = "Array" ;
        var refName = "Reference" ; // Placeholder for reference type.
        var boolName = "Boolean" ;

        // --- Scope Variable Initialization ---

        // Array of possible value types for adding new items.
        scope. valueTypes = [ stringName , objectName , arrayName , refName , boolName ] ;

        // Options for the ui-sortable directive used for arrays.
        scope. sortableOptions = {
            axis : 'y' // Allow sorting only along the Y-axis.
        } ;

        // Determine the initial collapsed state.
        if ( scope. $parent.defaultCollapsed === undefined ) {
            // If defaultCollapsed is not explicitly set by parent, default to false (expanded).
            scope. collapsed = false ;
        } else {
            // Otherwise, use the value provided by the parent scope.
            scope. collapsed = scope.defaultCollapsed ;
        }

        // Set the chevron icon based on the collapsed state.
        if ( scope.collapsed ) {
            scope. chevron = "glyphicon-chevron-right" ; // Right arrow for collapsed.
        } else {
            scope. chevron = "glyphicon-chevron-down" ; // Down arrow for expanded.
        }

        // --- Helper functions ---
        // These functions assist in type checking, state management, and data manipulation.

        /**
         * Determines the type of a given JavaScript object.
         * @param {any} obj The object to check.
         * @returns {string} "Object", "Array", "Boolean", or "Literal" for other primitive types.
         */
        var getType = function ( obj ) {

            var type = Object.prototype.toString.call ( obj ) ; // Get the internal [[Class]] property.

            if ( type === "[object Object]" ) {
                return "Object" ;
            }
            else if ( type === "[object Array]" ) {
                return "Array" ;
            }
            else if ( type === "[object Boolean]" ) {
                return "Boolean" ;
            }
            else {
                return "Literal" ; // For strings, numbers, null, undefined.
            }
        } ; // End of getType function.

        /**
         * Checks if a given value is a valid number.
         * @param {any} n The value to check.
         * @returns {boolean} True if 'n' is a number, false otherwise.
         */
        var isNumber = function ( n ) {
          return ! isNaN ( parseFloat ( n ) ) && isFinite ( n ) ;
        } ;

        // Expose getType to the scope.
        scope.getType = function ( obj ) {
            return getType ( obj ) ;
        } ;

        /**
         * Toggles the collapse state of the current JSON item (object or array).
         * Updates the chevron icon accordingly.
         */
        scope.toggleCollapse = function ( ) {
            if ( scope.collapsed ) {
                scope.collapsed = false ; // Expand it.
                scope.chevron = "glyphicon-chevron-down" ;
            } else {
                scope.collapsed = true ; // Collapse it.
                scope.chevron = "glyphicon-chevron-right" ;
            }
        } ; // End of toggleCollapse.

        /**
         * Renames a key in an object.
         * @param {object} obj The object containing the key.
         * @param {string} key The current key name.
         * @param {string} newkey The new key name.
         */
        scope.moveKey = function ( obj , key , newkey ) {
            // Only perform the move if the key names are different.
            if ( key !== newkey ) {
                obj[ newkey ] = obj[ key ] ; // Assign the value to the new key.
                delete obj[ key ] ; // Delete the old key.
            }
        } ; // End of moveKey.

        /**
         * Deletes an item from an object or an array.
         * Prompts the user for confirmation before deletion.
         * @param {object|array} obj The parent object or array.
         * @param {string|number} key The key (for objects) or index (for arrays) of the item to delete.
         */
        scope.deleteKey = function ( obj , key ) {
            if ( getType ( obj ) == "Object" ) {
                // For objects, confirm deletion of the key and its contents.
                if ( confirm ( 'Delete "' + key + '" and all it contains?' ) ) {
                    delete obj[ key ] ;
                }
            } else if ( getType ( obj ) == "Array" ) {
                // For arrays, confirm deletion of the specific item.
                if ( confirm ( 'Delete "' + obj[ key ] + '"?' ) ) {
                    obj.splice ( key , 1 ) ; // Remove one element at the specified index.
                }
            } else {
                // Log an error if the object type is not supported for deletion.
                console.error ( "object to delete from was " + obj ) ;
            }
        } ; // End of deleteKey.

        /**
         * Adds a new item to an object or an array based on the selected valueType.
         * Performs validation for object keys.
         * @param {object|array} obj The parent object or array to add to.
         */
        scope.addItem = function ( obj ) {
            if ( getType ( obj ) == "Object" ) {
                // --- Object specific logic for adding items ---

                // Input validation for the new key name.
                if ( scope.keyName == undefined || scope.keyName.length == 0 ) {
                    alert ( "Please fill in a name" ) ;
                } else if ( scope.keyName.indexOf ( "$" ) == 0 ) {
                    alert ( "The name may not start with $ (the dollar sign)" ) ;
                } else if ( scope.keyName.indexOf ( "_" ) == 0 ) {
                    alert ( "The name may not start with _ (the underscore)" ) ;
                } else {
                    // Check if a key with the same name already exists.
                    if ( obj[ scope.keyName ] ) {
                        if ( ! confirm ( 'An item with the name "' + scope.keyName
                            + '" exists already. Do you really want to replace it?' ) ) {
                            return ; // User chose not to replace, so exit.
                        }
                    }

                    // Add item to object based on selected valueType.
                    switch ( scope.valueType ) {
                        case stringName :
                            obj[ scope.keyName ] = scope.valueName ? scope.possibleNumber ( scope.valueName ) : "" ;
                            break ;
                        case objectName :
                            obj[ scope.keyName ] = { } ;
                            break ;
                        case arrayName :
                            obj[ scope.keyName ] = [ ] ;
                            break ;
                        case refName :
                            obj[ scope.keyName ] = { "Reference!!!!" : "todo" } ; // Placeholder for reference.
                            break ;
                        case boolName :
                            obj[ scope.keyName ] = false ;
                            break ;
                    }

                    // --- Clean-up after adding ---
                    scope.keyName = "" ;
                    scope.valueName = "" ;
                    scope.showAddKey = false ; // Hide the add item form.
                }
            } else if ( getType ( obj ) == "Array" ) {
                // --- Array specific logic for adding items ---

                // Add item to array based on selected valueType.
                switch ( scope.valueType ) {
                    case stringName :
                        obj.push ( scope.valueName ? scope.valueName : "" ) ;
                        break ;
                    case objectName :
                        obj.push ( { } ) ;
                        break ;
                    case arrayName :
                        obj.push ( [ ] ) ;
                        break ;
                    case boolName :
                        obj.push ( false ) ;
                        break ;
                    case refName :
                        obj.push ( { "Reference!!!!" : "todo" } ) ; // Placeholder for reference.
                        break ;
                }

                // --- Clean-up after adding ---
                scope.valueName = "" ;
                scope.showAddKey = false ; // Hide the add item form.
            } else {
                // Log an error if the object type is not supported for adding.
                console.error ( "object to add to was " + obj ) ;
            }
        } ; // End of addItem.

        /**
         * Converts a string value to a number if it's a valid number; otherwise, returns the original string.
         * This is useful for inputs that might represent numbers but are initially strings.
         * @param {string} val The value to potentially convert.
         * @returns {number|string} The number or the original string.
         */
        scope.possibleNumber = function ( val ) {
            return isNumber ( val ) ? parseFloat ( val ) : val ;
        } ; // End of possibleNumber.


        // --- Template Generation ---
        // These strings define the HTML structure for rendering different JSON types.
        // They are compiled and linked dynamically.

        // Note:
        // Sometimes using a different ng-model (e.g., a local scope variable)
        // and then saving it on ng-change into the actual child object or array
        // is necessary for all updates to propagate correctly in Angular.

        // Recursive template for displaying values based on their type.
        var switchTemplate =
            '<span ng-switch on="getType(val)" >'
                + '<json ng-switch-when="Object" child="val" type="object" default-collapsed="defaultCollapsed"></json>'
                + '<json ng-switch-when="Array" child="val" type="array" default-collapsed="defaultCollapsed"></json>'
                + '<span ng-switch-when="Boolean" type="boolean">'
                    + '<input type="checkbox" ng-model="val" ng-model-onblur ng-change="child[key] = val">'
                + '</span>'
                + '<span ng-switch-default class="jsonLiteral"><input type="text" ng-model="val" '
                    + 'placeholder="Empty" ng-model-onblur ng-change="child[key] = possibleNumber(val)"/>'
                + '</span>'
            + '</span>' ; // End of switchTemplate.

        // Template for the "add item" functionality, showing either a plus button or input fields.
        var addItemTemplate =
        '<div ng-switch on="showAddKey" class="block" >'
            + '<span ng-switch-when="true">' ;
                // If the current JSON item is an object, allow input for the key name.
                if ( scope.type == "object" ) {
                   addItemTemplate += '<input placeholder="Name" type="text" ui-keyup="{\'enter\':\'addItem(child)\'}" '
                        + 'class="form-control input-sm addItemKeyInput" ng-model="$parent.keyName" /> ' ;
                }
                addItemTemplate +=
                // Dropdown to select the type of the new value.
                '<select ng-model="$parent.valueType" ng-options="option for option in valueTypes" class="form-control input-sm"'
                    + 'ng-init="$parent.valueType=\'' + stringName + '\'" ui-keydown="{\'enter\':\'addItem(child)\'}"></select>'
                // Input field for the new value, shown only if the type is 'Text'.
                + '<span ng-show="$parent.valueType == \'' + stringName + '\'"> : <input type="text" placeholder="Value" '
                    + 'class="form-control input-sm addItemValueInput" ng-model="$parent.valueName" ui-keyup="{\'enter\':\'addItem(child)\'}"/></span> '
                // Add button to commit the new item.
                + '<button class="btn btn-primary btn-sm" ng-click="addItem(child)">Add</button> '
                // Cancel button to hide the add item form.
                + '<button class="btn btn-default btn-sm" ng-click="$parent.showAddKey=false">Cancel</button>'
            + '</span>'
            + '<span ng-switch-default>'
                // Plus button to reveal the add item form.
                + '<button class="addObjectItemBtn" ng-click="$parent.showAddKey = true"><i class="glyphicon glyphicon-plus"></i></button>'
            + '</span>'
        + '</div>' ; // End of addItemTemplate.

        // --- Main Template Construction based on Item Type ---
        var template ; // Declare template variable.

        // If the current scope's type is 'object'.
        if ( scope.type == "object" ) {
            template = '<i ng-click="toggleCollapse()" class="glyphicon" ng-class="chevron"></i>' // Collapse/expand icon.
            + '<span class="jsonItemDesc">' + objectName + '</span>' // Display "Object" label.
            + '<div class="jsonContents" ng-hide="collapsed">' // Container for object contents, hidden when collapsed.
                // Loop through key-value pairs in the child object.
                // ng-hide on keys starting with '_' to hide internal Angular properties.
                + '<span class="block" ng-hide="key.indexOf(\'_\') == 0" ng-repeat="(key, val) in child">'
                    // Object key display and edit.
                    + '<span class="jsonObjectKey">'
                        + '<input class="keyinput" type="text" ng-model="newkey" ng-init="newkey=key" '
                            + 'ng-blur="moveKey(child, key, newkey)"/>' // Input for key name, updates on blur.
                        // Delete button for the key-value pair.
                        + '<i class="deleteKeyBtn glyphicon glyphicon-trash" ng-click="deleteKey(child, key)"></i>'
                    + '</span>'
                    // Object value display, using the recursive switchTemplate.
                    + '<span class="jsonObjectValue">' + switchTemplate + '</span>'
                + '</span>'
                // End of ng-repeat.
                + addItemTemplate // Add the "add item" form.
            + '</div>' ; // End of jsonContents.
        } else if ( scope.type == "array" ) {
            // If the current scope's type is 'array'.
            template = '<i ng-click="toggleCollapse()" class="glyphicon"' // Collapse/expand icon.
            + 'ng-class="chevron"></i>'
            + '<span class="jsonItemDesc">' + arrayName + '</span>' // Display "Array" label.
            + '<div class="jsonContents" ng-hide="collapsed">' // Container for array contents, hidden when collapsed.
                + '<ol class="arrayOl" ui-sortable="sortableOptions" ng-model="child">' // Ordered list for array items, sortable.
                    // Loop through items in the child array.
                    + '<li class="arrayItem" ng-repeat="val in child">'
                        // Delete button for array item.
                        + '<i class="deleteKeyBtn glyphicon glyphicon-trash" ng-click="deleteKey(child, $index)"></i>'
                        // Drag handle for sorting array items.
                        + '<i class="moveArrayItemBtn glyphicon glyphicon-align-justify"></i>'
                        // Array item value display, using the recursive switchTemplate.
                        + '<span>' + switchTemplate + '</span>'
                    + '</li>'
                    // End of ng-repeat.
                + '</ol>'
                + addItemTemplate // Add the "add item" form.
            + '</div>' ; // End of jsonContents.
        } else {
            // Log an error if the scope type is neither object nor array.
            console.error ( "scope.type was " + scope.type ) ;
        }

        // Compile the generated template and link it to the current scope.
        var newElement = angular.element ( template ) ;
        $compile ( newElement ) ( scope ) ;

        // Replace the original directive element with the compiled template.
        element.replaceWith ( newElement ) ;
    } // End of link function.
  } ; // End of return object for 'json' directive.
} ] ) ; // End of 'json' directive definition.