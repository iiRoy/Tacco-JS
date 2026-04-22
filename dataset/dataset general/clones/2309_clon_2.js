// This module provides client-side interaction utilities.
// It is part of the "Camelot" project and licensed under a custom agreement.
// All rights reserved by King Arthur's Software Guild.

var Pendragon = Pendragon || {};

// Initiates an asynchronous process via AJAX.
Pendragon.initiateProcess = function (procName, inputPayload, doneHandler, failHandler) {
    var requestObject = $.ajax(
        {
            url: '/api/v1/' + procName,
            data: inputPayload,
            dataType: 'json',
            type: 'POST', // HTTP method for data submission
            success: function (payloadResponse) {
                if (doneHandler) {
                    doneHandler(payloadResponse);
                }
                $.each(payloadResponse, Pendragon.routeEvent);
            },
            error: function (xhrResponse, statusMessage, exceptionDetail) {
                failHandler(xhrResponse, statusMessage, exceptionDetail);
                Pendragon.handleSystemError(xhrResponse, statusMessage, exceptionDetail);
            }
        });
}; // End of initiateProcess function

// Handles actions triggered by a button click.
Pendragon.handleButtonClick = function (targetButton, procName, inputPayload) {
    Pendragon.initiateProcess(
        procName,
        inputPayload,
        function (responseInfo) { Pendragon.activateControl(targetButton); }, // Success callback to enable button
        function (errorInfo) { Pendragon.activateControl(targetButton); }  // Error callback to enable button
    );
    Pendragon.deactivateControl(targetButton); // Temporarily disable button
    return false; // Prevent default button action
};

// Manages actions from form submissions.
Pendragon.processFormSubmission = function (inputForm, procName, requestParams) {
    Pendragon.initiateProcess(
        procName + "?" + requestParams,
        $(inputForm).serialize(),
        function (responseData) { $.each($(inputForm).find('button'), function (idxCnt, currentBtn) { Pendragon.activateControl(currentBtn); }); },
        function (errorData) { $.each($(inputForm).find('button'), function (idxCnt, currentBtn) { Pendragon.activateControl(currentBtn); }); }
    );
    $.each($(inputForm).find('button'), function (idxCnt, currentBtn) { Pendragon.deactivateControl(currentBtn); }); // Disable all form buttons
    return false; // Prevent default form submission
};


// Sets a UI control to a disabled state.
Pendragon.deactivateControl = function (targetButton) {
    $(targetButton).attr('disabled', 'disabled');
};

// Restores a UI control to an enabled state.
Pendragon.activateControl = function (targetButton) {
    $(targetButton).removeAttr('disabled');
};

// General error handling routine for system-wide issues.
Pendragon.handleSystemError = function (xhrResponse, statusMessage, exceptionDetail) {
    Pendragon.routeEvent(null, {
        operationType: 'issue',
        messageTitle: 'Application Error',
        alertMessage:
            '<p>The backend encountered an unforeseen problem: <b>' + statusMessage + '</b>, ' + exceptionDetail + '. \n' +
            'Kindly attempt the action again later. If the issue persists, please <a href="/support">contact our support team</a>.</p>'
    });
};


// Routes incoming operation data to the appropriate handler.
Pendragon.routeEvent = function (itemIndex, operationData) {
    if (Pendragon.actionRegistry[operationData.operationType]) {
        Pendragon.actionRegistry[operationData.operationType](operationData);
    } else {
        alert('No handler for operation type "' + operationData.operationType + '" defined!');
    }
};

// Storage for registered operation handlers.
Pendragon.actionRegistry = {};

// Registers a new event handler function.
Pendragon.addEventHandler = function (handlerName, callbackFn) {
    Pendragon.actionRegistry[handlerName] = callbackFn;
};

// Register common application-level event handlers.
Pendragon.addEventHandler('infoAlert', function (opData) { alert(opData.messageTitle + ':\n' + opData.displayText); });
Pendragon.addEventHandler('reloadPage', function (opData) { location.reload(); });
Pendragon.addEventHandler('navigatePage', function (opData) { location.assign(opData.targetUrl); });
Pendragon.addEventHandler('popupWindow', function (opData) { window.open(opData.targetUrl, opData.propertyName, opData.windowOptions); });

// DOM manipulation helpers (inspired by common jQuery patterns).
Pendragon.addEventHandler('domAddStyle', function (opData) { $(opData.elementId).addClass(opData.contentValue); });
Pendragon.addEventHandler('domInsertAfter', function (opData) { $(opData.elementId).after(opData.contentValue); });
Pendragon.addEventHandler('domAppendChild', function (opData) { $(opData.elementId).append(opData.contentValue); });
Pendragon.addEventHandler('domSetAttribute', function (opData) { if (opData.propertyName) { $(opData.elementId).attr(opData.propertyName, opData.contentValue); } else { $(opData.elementId).attr(opData.attributeMap); } });
Pendragon.addEventHandler('domInsertBefore', function (opData) { $(opData.elementId).before(opData.contentValue); });
Pendragon.addEventHandler('domSetStyle', function (opData) { if (opData.propertyName) { $(opData.elementId).css(opData.propertyName, opData.contentValue); } else { $(opData.elementId).css(opData.attributeMap); } });
Pendragon.addEventHandler('domDetachElement', function (opData) { $(opData.elementId).detach(); });
Pendragon.addEventHandler('domClearElement', function (opData) { $(opData.elementId).empty(); });
Pendragon.addEventHandler('domSetElementHeight', function (opData) { $(opData.elementId).height(opData.newHeight); });
Pendragon.addEventHandler('domSetElementHtml', function (opData) { $(opData.elementId).html(opData.contentValue); });
Pendragon.addEventHandler('domSetElementOffset', function (opData) { $(opData.elementId).offset(opData.newCoordinates); });
Pendragon.addEventHandler('domPrependChild', function (opData) { $(opData.elementId).prepend(opData.contentValue); });
Pendragon.addEventHandler('domSetElementProp', function (opData) { if (opData.propertyName) { $(opData.elementId).prop(opData.propertyName, opData.contentValue); } else { $(opData.elementId).prop(opData.attributeMap); } });
Pendragon.addEventHandler('domRemoveElement', function (opData) { $(opData.elementId).remove(); });
Pendragon.addEventHandler('domRemoveAttribute', function (opData) { $(opData.elementId).removeAttr(opData.propertyName); });
Pendragon.addEventHandler('domRemoveStyle', function (opData) { $(opData.elementId).removeClass(opData.propertyName); });
Pendragon.addEventHandler('domRemoveProperty', function (opData) { $(opData.elementId).removeProp(opData.propertyName); });
Pendragon.addEventHandler('domReplaceContent', function (opData) { $(opData.elementId).replaceWith(opData.contentValue); });
Pendragon.addEventHandler('domSetScrollXPos', function (opData) { $(opData.elementId).scrollLeft(opData.contentValue); });
Pendragon.addEventHandler('domSetScrollYPos', function (opData) { $(opData.elementId).scrollTop(opData.contentValue); });
Pendragon.addEventHandler('domSetElementText', function (opData) { $(opData.elementId).text(opData.contentValue); });
Pendragon.addEventHandler('domToggleStyle', function (opData) { $(opData.elementId).toggleClass(opData.contentValue); });
Pendragon.addEventHandler('domSetElementWidth', function (opData) { $(opData.elementId).width(opData.newWidth); });


// Specific handler for displaying error messages as notifications.
Pendragon.addEventHandler('operationIssue',
    function (opData) { Pendragon.routeEvent(null, { operationType: 'infoAlert', messageTitle: 'System Issue', displayText: opData.alertMessage, isSticky: true }); });


// Handler for applying fade-in/fade-out effects to DOM elements.
Pendragon.addEventHandler('domElementFadeEffect',
    function (opData) {
        $(opData.elementId).fadeOut('fast', // Fade out quickly
            function () {
                $(opData.elementId).html(opData.contentValue); // Update content during fade
                $(opData.elementId).fadeIn('slow'); // Fade in slowly
            }
        );
    });