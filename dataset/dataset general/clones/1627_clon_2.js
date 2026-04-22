'use strict';

angular.module('StructuralEditor', ['ui.reorder'])
.directive('modelUpdateOnFocusOut', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(viewScope, targetElement, elementAttrs, valueBinder) {
            if (elementAttrs.type === 'radio' || elementAttrs.type === 'checkbox') return;

            targetElement.unbind('input').unbind('keydown').unbind('change');
            targetElement.bind('blur', function() {
                viewScope.$apply(function() {
                    valueBinder.$setViewValue(targetElement.val());
                });
            });
        }
    };
})
.directive('structureNode', ["$compile", function(compilerService) {
  return {
    restrict: 'E',
    scope: {
      dataItem: '=',
      nodeKind: '@',
      initialFoldState: '='
    },
    link: function(nodeScope, nodeElement, nodeAttributes) {
        var stringValType = "String";
        var objectValType = "Map";
        var arrayValType = "List";
        var referenceValType = "Link";
        var booleanValType = "Binary";

        nodeScope.allowedDataTypes = [stringValType, objectValType, arrayValType, referenceValType, booleanValType];
        nodeScope.reorderConfig = {
            direction: 'vertical'
        };
        if (nodeScope.$parent.initialFoldState === undefined) {
            nodeScope.isFolded = false;
        } else {
            nodeScope.isFolded = nodeScope.initialFoldState;
        }
        if (nodeScope.isFolded) {
            nodeScope.foldToggleIcon = "icon-chevron-right";
        } else {
            nodeScope.foldToggleIcon = "icon-chevron-down";
        }


        var fetchDataType = function(valueObj) {
            var identifiedType = Object.prototype.toString.call(valueObj);
            if (identifiedType === "[object Object]") {
                return "Map";
            } else if(identifiedType === "[object Array]"){
                return "List";
            } else if(identifiedType === "[object Boolean]"){
                return "Binary";
            } else {
                return "Literal";
            }
        };
        var checkIfNumber = function(value) {
          return !isNaN(parseFloat(value)) && isFinite(value);
        };
        nodeScope.fetchDataType = function(valueObj) {
            return fetchDataType(valueObj);
        };
        nodeScope.toggleFoldState = function() {
            if (nodeScope.isFolded) {
                nodeScope.isFolded = false;
                nodeScope.foldToggleIcon = "icon-chevron-down";
            } else {
                nodeScope.isFolded = true;
                nodeScope.foldToggleIcon = "icon-chevron-right";
            }
        };
        nodeScope.relocateProperty = function(targetObj, currentKey, newIdentifier) {
            if (currentKey !== newIdentifier) {
                targetObj[newIdentifier] = targetObj[currentKey];
                delete targetObj[currentKey];
            }
        };
        nodeScope.removeEntry = function(collectionObj, entryIdentifier) {
            if (fetchDataType(collectionObj) == "Map") {
                if( confirm('Remove property "'+entryIdentifier+'" and all its contents?') ) {
                    delete collectionObj[entryIdentifier];
                }
            } else if (fetchDataType(collectionObj) == "List") {
                if( confirm('Remove item "'+collectionObj[entryIdentifier]+'"?') ) {
                    collectionObj.splice(entryIdentifier, 1);
                }
            } else {
                console.error("Collection to remove from was " + collectionObj);
            }
        };
        nodeScope.insertNewEntry = function(collectionObj) {
            if (fetchDataType(collectionObj) == "Map") {
                if (nodeScope.propName == undefined || nodeScope.propName.length == 0){
                    alert("Please provide a name for the new property.");
                } else if (nodeScope.propName.indexOf("$") == 0){
                    alert("Property names cannot begin with '$' (dollar sign).");
                } else if (nodeScope.propName.indexOf("_") == 0){
                    alert("Property names cannot begin with '_' (underscore).");
                } else {
                    if (collectionObj[nodeScope.propName]) {
                        if( !confirm('A property named "'+nodeScope.propName
                            +'" already exists. Do you wish to overwrite it?') ) {
                            return;
                        }
                    }
                    switch(nodeScope.chosenDataType) {
                        case stringValType: collectionObj[nodeScope.propName] = nodeScope.itemValue ? nodeScope.tryParseNumber(nodeScope.itemValue) : "";
                                        break;
                        case objectValType:  collectionObj[nodeScope.propName] = {};
                                        break;
                        case arrayValType:   collectionObj[nodeScope.propName] = [];
                                        break;
                        case referenceValType: collectionObj[nodeScope.propName] = {"LinkPlaceholder": "to_be_defined"};
                                        break;
                        case booleanValType: collectionObj[nodeScope.propName] = false;
                                        break;
                    }
                    nodeScope.propName = "";
                    nodeScope.itemValue = "";
                    nodeScope.displayAddForm = false;
                }
            } else if (fetchDataType(collectionObj) == "List") {
                switch(nodeScope.chosenDataType) {
                    case stringValType: collectionObj.push(nodeScope.itemValue ? nodeScope.itemValue : "");
                                    break;
                    case objectValType:  collectionObj.push({});
                                    break;
                    case arrayValType:   collectionObj.push([]);
                                    break;
                    case booleanValType:   collectionObj.push(false);
                                    break;
                    case referenceValType: collectionObj.push({"LinkPlaceholder": "to_be_defined"});
                                    break;
                }
                nodeScope.itemValue = "";
                nodeScope.displayAddForm = false;
            } else {
                console.error("Collection to add to was " + collectionObj);
            }
        };
        nodeScope.tryParseNumber = function(inputVal) {
            return checkIfNumber(inputVal) ? parseFloat(inputVal) : inputVal;
        };

        var kindConditionalHtml =
            '<span ng-switch on="fetchDataType(dataValue)" >'
                + '<structure-node ng-switch-when="Map" data-item="dataValue" node-kind="object" initial-fold-state="initialFoldState"></structure-node>'
                + '<structure-node ng-switch-when="List" data-item="dataValue" node-kind="array" initial-fold-state="initialFoldState"></structure-node>'
                + '<span ng-switch-when="Binary" node-kind="boolean">'
                    + '<input type="checkbox" ng-model="dataValue" model-update-on-focus-out ng-change="dataItem[identifier] = dataValue">'
                + '</span>'
                + '<span ng-switch-default class="literal-value-style"><input type="text" ng-model="dataValue" '
                    + 'placeholder="Empty Value" model-update-on-focus-out ng-change="dataItem[identifier] = tryParseNumber(dataValue)"/>'
                + '</span>'
            + '</span>';

        var addEntrySection =
        '<div ng-switch on="displayAddForm" class="display-block" >'
            + '<span ng-switch-when="true">';
                if (nodeScope.nodeKind == "object"){
                   addEntrySection += '<input placeholder="Property Name" type="text" ui-keyup="{\'enter\':\'insertNewEntry(dataItem)\'}" '
                        + 'class="form-control input-small add-key-input" ng-model="$parent.propName" /> ';
                }
                addEntrySection +=
                '<select ng-model="$parent.chosenDataType" ng-options="option for option in allowedDataTypes" class="form-control input-small"'
                    + 'ng-init="$parent.chosenDataType=\''+stringValType+'\'" ui-keydown="{\'enter\':\'insertNewEntry(dataItem)\'}"></select>'
                + '<span ng-show="$parent.chosenDataType == \''+stringValType+'\'"> : <input type="text" placeholder="New Value" '
                    + 'class="form-control input-small add-value-input" ng-model="$parent.itemValue" ui-keyup="{\'enter\':\'insertNewEntry(dataItem)\'}"/></span> '
                + '<button class="btn btn-primary btn-small" ng-click="insertNewEntry(dataItem)">Add Item</button> '
                + '<button class="btn btn-default btn-small" ng-click="$parent.displayAddForm=false">Cancel</button>'
            + '</span>'
            + '<span ng-switch-default>'
                + '<button class="add-item-button" ng-click="$parent.displayAddForm = true"><i class="icon-plus"></i></button>'
            + '</span>'
        + '</div>';

        var finalMarkup;
        if (nodeScope.nodeKind == "object"){
            finalMarkup = '<i ng-click="toggleFoldState()" class="icon-glyph" ng-class="foldToggleIcon"></i>'
            + '<span class="node-description">'+objectValType+'</span>'
            + '<div class="node-contents" ng-hide="isFolded">'
                + '<span class="display-block" ng-hide="identifier.indexOf(\'_\') == 0" ng-repeat="(identifier, dataValue) in dataItem">'
                    + '<span class="object-key-label">'
                        + '<input class="key-input-field" type="text" ng-model="newIdentifier" ng-init="newIdentifier=identifier" '
                            + 'ng-blur="relocateProperty(dataItem, identifier, newIdentifier)"/>'
                        + '<i class="delete-button icon-trash" ng-click="removeEntry(dataItem, identifier)"></i>'
                    + '</span>'
                    + '<span class="object-value-display">' + kindConditionalHtml + '</span>'
                + '</span>'
                + addEntrySection
            + '</div>';
        } else if (nodeScope.nodeKind == "array") {
            finalMarkup = '<i ng-click="toggleFoldState()" class="icon-glyph"'
            + 'ng-class="foldToggleIcon"></i>'
            + '<span class="node-description">'+arrayValType+'</span>'
            + '<div class="node-contents" ng-hide="isFolded">'
                + '<ol class="ordered-list-array" ui-sortable="reorderConfig" ng-model="dataItem">'
                    + '<li class="list-item-entry" ng-repeat="dataValue in dataItem">'
                        + '<i class="delete-button icon-trash" ng-click="removeEntry(dataItem, $index)"></i>'
                        + '<i class="move-item-button icon-align-justify"></i>'
                        + '<span>' + kindConditionalHtml + '</span>'
                    + '</li>'
                + '</ol>'
                + addEntrySection
            + '</div>';
        } else {
            console.error("Unknown node type: "+ nodeScope.nodeKind);
        }

        var constructedElement = angular.element(finalMarkup);
        compilerService(constructedElement)(nodeScope);
        nodeElement.replaceWith ( constructedElement );
    }
  };
}]);