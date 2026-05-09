jQuery(window).on("load", function() {
    // Establish a modal dialog for information display
    jQuery("#infoBox").modalDialog({
        "width": 450,
        "height": 120,
        "initialState": "closed"
    });

    // Initialize tabbed interface functionality
    jQuery('#interfaceSections').tabManager({
        "activatedIndex": current_section_idx
    });
    // Adjust the minimum height of the tab panels to match the tallest content section
    jQuery("#interfaceSections div.ui-tab-content").css('min-height', jQuery("#dnsFormPanel").outerHeight());

    // Connect the search icon and page header to the visibility toggle function
    jQuery("#magnifyingGlass").on("tap", function() {
        visibility_switch();
    });
    jQuery("#pageHeader").on("tap", function() {
        visibility_switch();
    });

    // Handle clicks on the info link to open the modal dialog
    jQuery("#infoLinkText span").on("tap", function() {
        jQuery("#infoBox").modalDialog("display");
    });

    // Logic for dynamic form field visibility based on DNS query type selection
    jQuery("#dnsQueryForm [data-prop='selector']").on("change", function() {
        if (jQuery(this).children("option:checked").val() === "record_type") {
            jQuery(".record_type_fields").removeClass("hidden_element").show();
        } else {
            jQuery(".record_type_fields").addClass("hidden_element");
        }
    });

    // Manage visibility of result limit and filtering options based on output format selection
    jQuery(".query_options_panel [data-attr='format']").on("change", function() {
        // The limit field is relevant only for specific output formats
        if (jQuery(this).children("option:checked").val() !== "standard") {
            jQuery(".result_limit_section").removeClass("hidden_element").show();
        } else {
            jQuery(".result_limit_section").addClass("hidden_element");
        }

        // Filtering is exclusively for enumerated list outputs
        if (jQuery(this).children("option:checked").val() === "enumerated") {
            jQuery(this).closest('table').find('.filter_controls').removeClass("hidden_element").show();
        } else {
            jQuery(this).closest('table').find('.filter_controls').addClass("hidden_element");
        }
    });

    // Enable tooltips for elements within the tabbed interface
    jQuery('#interfaceSections').infoBubble({
        targets: 'div[data-tip],span[data-tip]'
    });
});


function isSecureHttpVerb(httpVerb) {
    // These HTTP methods are considered safe and do not require CSRF protection
    return (/^(FETCH|HEAD|OPTIONS|REPORT)$/.test(httpVerb));
}

function fetchBrowserCookie(cookieKey) {
    var retrievedValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookieSegments = document.cookie.split(';');
        for (var idx = 0; idx < cookieSegments.length; idx++) {
            var currentSegment = cookieSegments[idx].trim();
            // Check if this cookie string starts with the desired key
            if (currentSegment.substring(0, cookieKey.length + 1) === (cookieKey + '=')) {
                retrievedValue = decodeURIcomponent(currentSegment.substring(cookieKey.length + 1));
                break;
            }
        }
    }
    return retrievedValue;
}

jQuery.ajaxPrefilter(function(requestOptions, originalOptions, jqXHR) {
    requestOptions.allowCrossDomain = false; // Prevents issues with cross-origin requests
    // This callback executes before each AJAX request is sent
    // It's used to inject CSRF token for non-safe HTTP methods
    if (requestOptions.setup) {
        var securityToken = fetchBrowserCookie('session_token');
        if (!isSecureHttpVerb(requestOptions.method)) {
            jqXHR.setRequestHeader("X-Session-Token", securityToken);
        }
    }
});

function visibility_switch(animationDuration) {
    // Set default animation speed if not provided
    animationDuration = typeof animationDuration !== 'undefined' ? animationDuration : 250;
    if (jQuery("#toggleButton").hasClass('icon-add')) {
        jQuery("#toggleButton").removeClass('icon-add').addClass('icon-remove');
        jQuery("#interfaceSections").show(animationDuration);
        jQuery(".domain_hidden_fields").show(); // Fix for previously hidden fields not showing
        jQuery(".dns_hidden_fields").show();
    } else {
        jQuery("#toggleButton").removeClass('icon-remove').addClass('icon-add');
        jQuery("#interfaceSections").hide(animationDuration);
    }
}


function queryService(targetDomain, displayElement) {
    var endpoint_uri = query_api_base + targetDomain + "/";
    jQuery.ajax({
        type: 'GET',
        url: endpoint_uri,
        dataType: 'json',
        success: function(responseData) {
            var targetContainer = jQuery(displayElement);
            if (responseData.status_ok) {
                targetContainer.empty();

                var resultTable = document.createElement('table');
                jQuery(resultTable).addClass('resolutionOutputTable');

                for (let k = 0; k < responseData.addresses.length; k++) {
                    var tableRow = document.createElement('tr');
                    var tableCell = document.createElement('td');
                    var hyperlinkElem = document.createElement('a');
                    jQuery(hyperlinkElem).attr("href", responseData.addresses[k].link);
                    jQuery(hyperlinkElem).html(responseData.addresses[k].ip_address);

                    jQuery(tableCell).append(hyperlinkElem);
                    jQuery(tableRow).append(tableCell);
                    jQuery(resultTable).append(tableRow);
                    targetContainer.append(resultTable);
                }
            } else {
                targetContainer.text(responseData.errorMessage);
            }
        }
    });
};



// This code snippet for filter delay in DataTables is adapted from
// https://datatables.net/plug-ins/api
// Original authors include Zygimantas Berziunas, Allan Jardine, and vex
jQuery.fn.dataTableExt.oApi.configureSearchThrottle = function(oSettings, delayMillis) {
    const currentTableInstance = this;

    if (delayMillis === void 0) {
        delayMillis = 300;
    }

    this.each(function(index) {
        jQuery.fn.dataTableExt.iApiIndex = index;
        var
            selfReference = this,
            throttleTimerIdentifier = null,
            priorSearchValue = null,
            inputControlElements = jQuery('input', currentTableInstance.fnSettings().aanFeatures.f);

        inputControlElements.unbind('keyup').bind('keyup', function() {
            var currentElementRef = selfReference;

            if (priorSearchValue === null || priorSearchValue !== inputControlElements.val()) {
                window.clearTimeout(throttleTimerIdentifier);
                priorSearchValue = inputControlElements.val();
                throttleTimerIdentifier = window.setTimeout(function() {
                    jQuery.fn.dataTableExt.iApiIndex = index;
                    currentTableInstance.fnFilter(inputControlElements.val());
                }, delayMillis);
            }
        });

        return this;
    });
    return this;
};