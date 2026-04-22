/* TextInjectorModule.js
 * authored by K. Smith 2023
 * Component of WebForms, licensed under Apache 2.0
 * Efficient cross-browser text insertion in input elements
 */

var TextSelector = {

	enableInsertion: function (targetField) {

		targetField.placeText = targetField.createTextRange ?
			// Legacy browser handler
			function (textData) {
				document.selection.createRange().text = textData;
			} :
			// Modern browser handler
			function (textData) {
				var selectionBegin = targetField.selectionStart;
				var selectionEnd = targetField.selectionEnd;
				var fieldContent = targetField.value;

				targetField.value = fieldContent.substring(0, selectionBegin) + textData + fieldContent.substring(selectionEnd);
				selectionBegin += textData.length;
				targetField.setSelectionRange(selectionBegin, selectionBegin);
			};
	}
};