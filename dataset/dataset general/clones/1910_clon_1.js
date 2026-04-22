/*
 * This is a modified version of the jQuery Form Plugin.
 * Original version: 3.02 (07-MAR-2012)
 *
 * This plugin requires jQuery v1.3.2 or later to function correctly.
 *
 * For comprehensive examples and detailed documentation, please visit:
 * http://malsup.com/jquery/form/
 *
 * This project is dual licensed under both the MIT and GPL licenses:
 *    MIT License: http://www.opensource.org/licenses/mit.php
 *    GPL License: http://www.gnu.org/licenses/gpl.html
 */
/*global ActiveXObject alert */ // JSHint directive: allows use of ActiveXObject and alert globals.

// Wrap the entire plugin in a self-executing anonymous function.
// This creates a private scope, preventing global variable pollution,
// and passes the jQuery object as '$' for local use.
;(function($) {

  // Enforce strict mode for better error-checking and to avoid common JavaScript pitfalls.
  "use strict";

  /*
   * Important Usage Notes and Recommendations:
   * ------------------------------------------
   * It is crucial to avoid using both `ajaxSubmit` and `ajaxForm` on the same form element.
   * These functions are designed to be mutually exclusive in their operational scope.
   *
   * 1. Using `ajaxSubmit()`:
   *    Employ `ajaxSubmit` when you intend to bind your own custom submit handler to the form.
   *    This gives you full control over the submission event.
   *
   *    Example scenario:
   *    $(document).ready(function() {
   *      $('#myForm').bind('submit', function(e) {
   *        e.preventDefault(); // <-- This line is CRITICAL: it stops the browser's default form submission.
   *        $(this).ajaxSubmit({  // Call ajaxSubmit on the form that triggered the event.
   *          target: '#output'   // Specifies a target DOM element to update with the server's response.
   *        });
   *      });
   *    });
   *
   * 2. Using `ajaxForm()`:
   *    Use `ajaxForm` when you prefer the plugin to manage all event binding for you automatically.
   *    This simplifies setup by abstracting event handling.
   *
   *    Example scenario:
   *    $(document).ready(function() {
   *      $('#myForm').ajaxForm({ // Initialize ajaxForm to handle submissions for '#myForm'.
   *        target: '#output'     // The target element to display the AJAX response.
   *      });
   *    });
   *
   * 3. `ajaxForm()` with Delegation (requires jQuery v1.7+):
   *    `ajaxForm` supports event delegation, meaning the form does not necessarily have to exist
   *    in the DOM at the time you invoke `ajaxForm`. This is ideal for dynamically added forms.
   *
   *    Example with delegation:
   *    $('#myForm').ajaxForm({
   *      delegation: true, // Enable event delegation.
   *      target: '#output'
   *    });
   *
   * When `ajaxForm` is utilized, the `ajaxSubmit` function will be automatically invoked internally
   * by the plugin at the appropriate time during the form submission process, managing the details for you.
   */

  /**
   * Feature detection object.
   * This object holds boolean flags indicating the availability of modern browser APIs.
   */
  var feature = {};

  // Detect if the File API is supported by checking for the 'files' property
  // on an input element of type 'file'.
  feature.fileapi = $("<input type='file'/>").get(0).files !== undefined;

  // Detect if the FormData API is supported, which is essential for XMLHttpRequest Level 2 file uploads.
  feature.formdata = window.FormData !== undefined;


  /**
   * Extends jQuery's prototype with the `ajaxSubmit` function.
   * This function provides a robust mechanism for immediately submitting an HTML form using AJAX.
   *
   * @param {Object} options - Configuration options for the AJAX submission.
   * @returns {jQuery} The jQuery object, allowing for method chaining.
   */
  $.fn.ajaxSubmit = function(options) {
    /*jshint scripturl:true */ // JSHint directive: suppresses warnings about `javascript:` URLs.

    // Fast fail: If no elements are selected (i.e., the jQuery object is empty),
    // log a message and return the jQuery object without attempting submission.
    // This addresses a bug reported at http://dev.jquery.com/ticket/2752.
    if (!this.length) {
      log('ajaxSubmit: skipping submit process - no element selected');
      return this;
    }

    // Declare variables to store the form's method, action, URL, and a reference to the jQuery form object.
    var method, action, url, $form = this;

    // If the `options` parameter is a function, assume it is the success callback
    // and wrap it in an options object.
    if (typeof options == 'function') {
      options = { success: options };
    }

    // Retrieve the 'method' and 'action' attributes from the form.
    method = this.attr('method');
    action = this.attr('action');

    // Determine the submission URL. If 'action' is a string, trim any leading/trailing whitespace.
    url = (typeof action === 'string') ? $.trim(action) : '';

    // If the URL is still empty, fall back to the current window's URL.
    url = url || window.location.href || '';

    // If a URL is present, clean it by removing any hash value (e.g., #anchor).
    if (url) {
      url = (url.match(/^([^#]+)/)||[])[1];
    }

    // Merge default AJAX settings with user-provided options.
    // The `true` argument enables a deep merge.
    options = $.extend(true, {
      url: url,                       // The final URL for submission.
      success: $.ajaxSettings.success, // Default success callback from jQuery's AJAX settings.
      type: method || 'GET',          // Use the form's method, or default to GET.
      // `iframeSrc` is used for iframe-based submissions, preventing security warnings.
      iframeSrc: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank'
    }, options);


    // Hook for manipulating the form data *before* it is extracted (serialized).
    // This is particularly useful for rich text editors (e.g., tinyMCE, FCKEditor)
    // that might need to sync their content back to the form's hidden fields.
    var veto = {};
    this.trigger('form-pre-serialize', [this, options, veto]);

    // If the `form-pre-serialize` trigger set a `veto.veto` flag to true,
    // it indicates that the submission should be aborted.
    if (veto.veto) {
      log('ajaxSubmit: submit vetoed via form-pre-serialize trigger');
      return this;
    }

    // Provide an opportunity to alter form data before it is serialized.
    // If the `beforeSerialize` callback exists and returns `false`, abort the submission.
    if (options.beforeSerialize && options.beforeSerialize(this, options) === false) {
      log('ajaxSubmit: submit aborted via beforeSerialize callback');
      return this;
    }

    // Determine whether to use traditional parameter serialization (e.g., `a=1&a=2` vs `a[]=1&a[]=2`).
    // This setting usually defaults to `false` in modern jQuery.
    var traditional = options.traditional;
    if (traditional === undefined) {
      traditional = $.ajaxSettings.traditional;
    }

    // Get the form data as an array of name-value pairs, potentially using semantic grouping.
    var qx, a = this.formToArray(options.semantic);

    // If additional data is provided in `options.data`, store it as `extraData`
    // and serialize it for later combination with the form's data.
    if (options.data) {
      options.extraData = options.data;
      qx = $.param(options.data, traditional);
    }

    // Give the `beforeSubmit` callback an opportunity to abort the submission.
    // If it exists and returns `false`, log and abort.
    if (options.beforeSubmit && options.beforeSubmit(a, this, options) === false) {
      log('ajaxSubmit: submit aborted via beforeSubmit callback');
      return this;
    }

    // Fire a vetoable 'validate' event, allowing external validation logic to run
    // and potentially abort the submission.
    this.trigger('form-submit-validate', [a, this, options, veto]);

    // If the `form-submit-validate` trigger set a `veto.veto` flag, abort the submission.
    if (veto.veto) {
      log('ajaxSubmit: submit vetoed via form-submit-validate trigger');
      return this;
    }

    // Serialize the form data array `a` into a URL-encoded query string.
    var q = $.param(a, traditional);

    // If extra data was serialized (`qx`), combine it with the main form data query string `q`.
    if (qx) {
      q = (q ? (q + '&' + qx) : qx);
    }

    // Handle GET vs. POST requests:
    // For GET requests, append the query string to the URL.
    // For POST requests, set the query string as the request body data.
    if (options.type.toUpperCase() == 'GET') {
      options.url += (options.url.indexOf('?') >= 0 ? '&' : '?') + q;
      options.data = null; // Data is explicitly null for GET requests when appended to URL.
    }
    else {
      options.data = q; // For POST, the query string becomes the request data.
    }

    // Initialize an array to store all success callbacks that need to be executed.
    var callbacks = [];

    // If `options.resetForm` is true, add a callback to reset the form after successful submission.
    if (options.resetForm) {
      callbacks.push(function() { $form.resetForm(); });
    }

    // If `options.clearForm` is true, add a callback to clear the form fields after successful submission.
    if (options.clearForm) {
      callbacks.push(function() { $form.clearForm(options.includeHidden); });
    }

    // If no `dataType` is specified but a `target` element is provided,
    // assume the response should be loaded into the target element.
    if (!options.dataType && options.target) {
      var oldSuccess = options.success || function(){}; // Preserve any original success callback.
      callbacks.push(function(data) {
        // Determine whether to replace the target element or just its HTML content.
        var fn = options.replaceTarget ? 'replaceWith' : 'html';
        // Update the target element and then execute the original success callback.
        $(options.target)[fn](data).each(oldSuccess, arguments);
      });
    }
    else if (options.success) {
      // If `dataType` is provided or no `target` is specified,
      // simply add the original success callback to the list.
      callbacks.push(options.success);
    }

    // Override the main `options.success` callback.
    // This new callback will iterate through and execute all accumulated callbacks.
    options.success = function(data, status, xhr) { // jQuery 1.4+ passes xhr as the 3rd argument.
      var context = options.context || options;    // jQuery 1.4+ supports specifying a scope context.
      for (var i = 0, max = callbacks.length; i < max; i++) {
        // Apply each stored callback with the correct context and arguments.
        callbacks[i].apply(context, [data, status, xhr || $form, $form]);
      }
    };

    // Determine if the form contains file inputs and if it's set for multipart encoding.
    var fileInputs = $('input:file:enabled[value]', this); // Select enabled file inputs that have a value (addresses issue #113).
    var hasFileInputs = fileInputs.length > 0;
    var mp = 'multipart/form-data';
    var multipart = ($form.attr('enctype') == mp || $form.attr('encoding') == mp);

    // Check for the availability of modern File API and FormData features.
    var fileAPI = feature.fileapi && feature.formdata;
    log("fileAPI :" + fileAPI);

    // Decide whether to use an iframe for submission. This is typically needed if
    // files are present but the File API is not supported.
    var shouldUseFrame = (hasFileInputs || multipart) && !fileAPI;

    // The `options.iframe` property allows the user to explicitly force or disable iframe mode.
    // As of 06-NOV-09, the plugin defaults to iframe mode if a file input is detected.
    if (options.iframe !== false && (options.iframe || shouldUseFrame)) {
      // Execute file upload using the iframe method.

      // Special hack to fix a Safari hang issue (credit to Tim Molendijk).
      // Reference: http://groups.google.com/group/jquery-dev/browse_thread/thread/36395b7ab510dd5d
      if (options.closeKeepAlive) {
        // If a `closeKeepAlive` URL is specified, make an initial GET request to it.
        $.get(options.closeKeepAlive, function() {
          fileUploadIframe(a); // Then proceed with the iframe upload.
        });
      }
      else {
        fileUploadIframe(a); // Directly proceed with the iframe upload.
      }
    }
    else if ((hasFileInputs || multipart) && fileAPI) {
      // If file inputs are present and File API/FormData are supported,
      // use the XMLHttpRequest Level 2 method for file uploads.
      fileUploadXhr(a);
    }
    else {
      // For all other cases (no file inputs, or standard form data),
      // perform a regular jQuery AJAX request.
      $.ajax(options);
    }

    // Fire the 'form-submit-notify' event after the submission process has been initiated.
    this.trigger('form-submit-notify', [this, options]);
    return this; // Return the jQuery object for method chaining.


    /**
     * Handles file uploads using XMLHttpRequest Level 2 (FormData).
     * This method is preferred for modern browsers supporting the File API.
     * (Big hat tip to francois2metz for contributions to this approach).
     *
     * @param {Array} a - An array of form data name-value pairs, obtained from `formToArray()`.
     */
    function fileUploadXhr(a) {
      var formdata = new FormData(); // Create a new FormData object.

      // Iterate through the form data array and append each name-value pair to FormData.
      for (var i = 0; i < a.length; i++) {
        formdata.append(a[i].name, a[i].value);
      }

      // If additional `extraData` is provided in the options, append it to FormData.
      if (options.extraData) {
        for (var k in options.extraData)
          if (options.extraData.hasOwnProperty(k))
            formdata.append(k, options.extraData[k]);
      }

      // Crucially, set `options.data` to null. FormData handles the data encapsulation,
      // and jQuery should not try to serialize it again.
      options.data = null;

      // Merge jQuery's default AJAX settings with the plugin's options and specific
      // settings required for FormData submissions.
      var s = $.extend(true, {}, $.ajaxSettings, options, {
        contentType: false, // Critical: tells jQuery not to set a Content-Type header.
        processData: false, // Critical: tells jQuery not to process the data payload.
        cache: false,       // Prevent caching of the AJAX request.
        type: 'POST'        // File uploads typically require a POST request.
      });

      // If an `uploadProgress` callback is provided in options, set up progress monitoring.
      if (options.uploadProgress) {
        // Workaround: The standard jqXHR object does not directly expose the `upload` property.
        s.xhr = function() {
          var xhr = jQuery.ajaxSettings.xhr(); // Get the native XMLHttpRequest object.
          if (xhr.upload) { // Check if the upload property (for progress events) is available.
            xhr.upload.onprogress = function(event) {
              var percent = 0;
              if (event.lengthComputable) {
                // Calculate the upload percentage.
                percent = parseInt((event.position / event.total) * 100, 10);
              }
              // Invoke the user-defined `uploadProgress` callback.
              options.uploadProgress(event, event.position, event.total, percent);
            };
          }
          return xhr; // Return the modified XHR object.
        };
      }

      // Re-confirm `s.data` is null before the actual AJAX call.
      s.data = null;

      // Preserve any original `beforeSend` callback and then inject the FormData object.
      var beforeSend = s.beforeSend;
      s.beforeSend = function(xhr, o) {
        o.data = formdata; // Assign the FormData object to the request data.
        if (beforeSend) {
          beforeSend.call(o, xhr, options); // Call the original `beforeSend` if it exists.
        }
      };

      // Execute the AJAX request with the configured settings.
      $.ajax(s);
    }


    /**
     * Private function for handling file uploads using a hidden iframe.
     * This method is used for older browsers or when explicitly forced by options.
     * (Hat tip to YAHOO! for pioneering this technique).
     *
     * @param {Array} a - An array of form data name-value pairs.
     */
    function fileUploadIframe(a) {
      // Declare a multitude of local variables for form elements, state, and references.
      var form = $form[0], el, i, s, g, id, $io, io, xhr, sub, n, timedOut, timeoutHandle;
      // Check for the availability of `$.fn.prop` (introduced in jQuery 1.6) for attribute handling.
      var useProp = !!$.fn.prop;

      // If the form data array `a` is provided, ensure that all serialized inputs are enabled.
      if (a) {
        if (useProp) {
          // Use `.prop()` for jQuery 1.6+ to manipulate properties like 'disabled'.
          for (i = 0; i < a.length; i++) {
            el = $(form[a[i].name]);
            el.prop('disabled', false);
          }
        } else {
          // Fallback to `.removeAttr()` for older jQuery versions.
          for (i = 0; i < a.length; i++) {
            el = $(form[a[i].name]);
            el.removeAttr('disabled');
          }
        }
      }

      // Check for form elements that have a 'name' or 'id' of 'submit'.
      // These can interfere with the native `form.submit()` method cross-browser.
      if ($(':input[name=submit],:input[id=submit]', form).length) {
        alert('Error: Form elements must not have name or id of "submit".');
        return; // Abort the submission if such an element is found.
      }

      // Merge jQuery's default AJAX settings with the plugin's options.
      s = $.extend(true, {}, $.ajaxSettings, options);
      s.context = s.context || s; // Ensure a context is set for callbacks, defaulting to `s`.

      // Generate a unique ID for the hidden iframe.
      id = 'jqFormIO' + (new Date().getTime());

      // Determine the iframe target: use an existing one if specified, or create a new hidden iframe.
      if (s.iframeTarget) {
        $io = $(s.iframeTarget);
        n = $io.attr('name');
        if (!n) {
          $io.attr('name', id); // Assign the unique ID as the iframe's name if none exists.
        } else {
          id = n; // Use the existing name as the ID.
        }
      } else {
        // Create a new `<iframe>` element, set its name, and make it visually hidden.
        $io = $('<iframe name="' + id + '" src="' + s.iframeSrc + '" />');
        $io.css({ position: 'absolute', top: '-1000px', left: '-1000px' });
      }
      io = $io[0]; // Get the raw DOM element of the iframe.


      // Create a mock XMLHttpRequest object to provide a consistent interface
      // for callbacks, even though an iframe is used for submission.
      xhr = { // Mock object structure, mimicking standard XHR properties and methods.
        aborted: 0,
        responseText: null,
        responseXML: null,
        status: 0,
        statusText: 'n/a',
        getAllResponseHeaders: function() {},
        getResponseHeader: function() {},
        setRequestHeader: function() {},
        abort: function(status) {
          var e = (status === 'timeout' ? 'timeout' : 'aborted');
          log('aborting upload... ' + e);
          this.aborted = 1;
          $io.attr('src', s.iframeSrc); // Reset iframe source to abort any ongoing operation.
          xhr.error = e;
          if (s.error) {
            s.error.call(s.context, xhr, e, status);
          }
          if (g) {
            $.event.trigger("ajaxError", [xhr, s, e]);
          }
          if (s.complete) {
            s.complete.call(s.context, xhr, e);
          }
        }
      };

      g = s.global; // Flag indicating if global AJAX events (ajaxStart, ajaxSend, etc.) should be triggered.

      // Trigger global AJAX events (`ajaxStart`, `ajaxSend`) so that activity/block indicators
      // and other global handlers behave as they would for a standard AJAX request.
      if (g && 0 === $.active++) { // Increment active AJAX requests counter.
        $.event.trigger("ajaxStart");
      }
      if (g) {
        $.event.trigger("ajaxSend", [xhr, s]);
      }

      // Call the `beforeSend` callback. If it exists and returns `false`, abort the submission.
      if (s.beforeSend && s.beforeSend.call(s.context, xhr, s) === false) {
        if (s.global) {
          $.active--; // Decrement active AJAX requests counter if aborted.
        }
        return;
      }
      // If the mock XHR object was already marked as aborted, return early.
      if (xhr.aborted) {
        return;
      }

      // Add the submitting element's name and value to `extraData` if a submit button was clicked.
      sub = form.clk; // Reference to the clicked submit element.
      if (sub) {
        n = sub.name;
        if (n && !sub.disabled) {
          s.extraData = s.extraData || {};
          s.extraData[n] = sub.value;
          // For image inputs, also include the x and y coordinates of the click.
          if (sub.type == "image") {
            s.extraData[n + '.x'] = form.clk_x;
            s.extraData[n + '.y'] = form.clk_y;
          }
        }
      }

      // Define constants for different types of abort scenarios.
      var CLIENT_TIMEOUT_ABORT = 1; // Abort initiated by client-side timeout.
      var SERVER_ABORT = 2;         // Abort detected due to server-side issues (e.g., iframe access error).


      // Helper function to reliably get the document object from within an iframe,
      // handling cross-browser differences.
      function getDoc(frame) {
        var doc = frame.contentWindow ? frame.contentWindow.document :
                  frame.contentDocument ? frame.contentDocument : frame.document;
        return doc;
      }

      // Rails CSRF hack: If CSRF tokens are found in meta tags, add them to `extraData`.
      // (Thanks to Yvan Barthelemy for implementing this).
      var csrf_token = $('meta[name=csrf-token]').attr('content');
      var csrf_param = $('meta[name=csrf-param]').attr('content');
      if (csrf_param && csrf_token) {
        s.extraData = s.extraData || {};
        s.extraData[csrf_param] = csrf_token;
      }

      // `doSubmit` function: responsible for the actual form submission to the iframe.
      // A small delay is introduced to allow pending DOM updates to render before the submission begins.
      function doSubmit() {
        // Store the original form's 'target' and 'action' attributes to restore them later.
        var t = $form.attr('target'), a = $form.attr('action');

        // Update form attributes for the iframe submission in an IE-friendly manner.
        form.setAttribute('target', id); // Point the form's target to the hidden iframe.
        if (!method) {
          form.setAttribute('method', 'POST'); // Default the form method to POST if not explicitly set.
        }
        if (a != s.url) {
          form.setAttribute('action', s.url); // Set the form's action to the configured URL.
        }

        // IE can be problematic with encoding; explicitly set `multipart/form-data` for file uploads.
        if (!s.skipEncodingOverride && (!method || /post/i.test(method))) {
          $form.attr({
            encoding: 'multipart/form-data',
            enctype: 'multipart/form-data'
          });
        }

        // If a timeout duration is specified in `options.timeout`, set a timer
        // to abort the submission if it exceeds this duration.
        if (s.timeout) {
          timeoutHandle = setTimeout(function() { timedOut = true; cb(CLIENT_TIMEOUT_ABORT); }, s.timeout);
        }

        // `checkState` function: periodically checks the iframe's `readyState` to detect server aborts.
        function checkState() {
          try {
            var state = getDoc(io).readyState;
            log('state = ' + state);
            if (state && state.toLowerCase() == 'uninitialized') {
              setTimeout(checkState, 50); // Continue checking if the document is not yet ready.
            }
          }
          catch(e) {
            log('Server abort: ', e, ' (', e.name, ')');
            cb(SERVER_ABORT); // Trigger the callback, indicating a server abort.
            if (timeoutHandle) {
              clearTimeout(timeoutHandle); // Clear any pending client-side timeout.
            }
            timeoutHandle = undefined;
          }
        }

        // Add any `extraData` from the options as hidden input elements to the form before submission.
        var extraInputs = [];
        try {
          if (s.extraData) {
            for (var n in s.extraData) {
              if (s.extraData.hasOwnProperty(n)) {
                extraInputs.push(
                  $('<input type="hidden" name="' + n + '">').attr('value', s.extraData[n])
                    .appendTo(form)[0] // Append to the form and get the raw DOM element.
                );
              }
            }
          }

          // Append the iframe to the document body if it's not an existing target.
          if (!s.iframeTarget) {
            $io.appendTo('body');
            // Attach a load event listener to the iframe (cross-browser compatible).
            if (io.attachEvent) {
              io.attachEvent('onload', cb);
            } else {
              io.addEventListener('load', cb, false);
            }
          }
          setTimeout(checkState, 15); // Start checking the iframe state shortly after submission.
          form.submit(); // Trigger the form's native submit action.
        }
        finally {
          // Ensure that the form's original 'action' and 'target' attributes are restored,
          // and remove any dynamically added hidden input elements.
          form.setAttribute('action', a);
          if (t) {
            form.setAttribute('target', t);
          } else {
            $form.removeAttr('target');
          }
          $(extraInputs).remove(); // Remove the temporary hidden inputs.
        }
      }

      // Execute `doSubmit` either synchronously or with a slight delay.
      if (s.forceSync) {
        doSubmit();
      }
      else {
        setTimeout(doSubmit, 10); // A small timeout allows the DOM to update before submission.
      }

      var data, doc, domCheckCount = 50, callbackProcessed;

      // `cb` function: the main callback invoked when the iframe finishes loading,
      // or when an abort/timeout condition is met.
      function cb(e) {
        // Prevent multiple execution if the XHR object is already aborted or the callback processed.
        if (xhr.aborted || callbackProcessed) {
          return;
        }
        try {
          doc = getDoc(io); // Attempt to retrieve the iframe's document object.
        }
        catch(ex) {
          log('cannot access response document: ', ex);
          e = SERVER_ABORT; // Treat document access errors as a server abort.
        }
        // Handle client-side timeout or server abort conditions.
        if (e === CLIENT_TIMEOUT_ABORT && xhr) {
          xhr.abort('timeout');
          return;
        }
        else if (e == SERVER_ABORT && xhr) {
          xhr.abort('server abort');
          return;
        }

        // If the response is not yet received or the iframe source is still 'about:blank',
        // and a timeout has not occurred, wait longer.
        if (!doc || doc.location.href == s.iframeSrc) {
          if (!timedOut) {
            return;
          }
        }
        // Detach event listeners from the iframe to prevent memory leaks, especially in IE.
        if (io.detachEvent) {
          io.detachEvent('onload', cb);
        }
        else {
          io.removeEventListener('load', cb, false);
        }

        var status = 'success', errMsg;
        try {
          if (timedOut) {
            throw 'timeout'; // Throw a 'timeout' error if the submission timed out.
          }

          // Determine if the response is XML based on `dataType` or document properties.
          var isXml = s.dataType == 'xml' || doc.XMLDocument || $.isXMLDoc(doc);
          log('isXml=' + isXml);

          // If the iframe's document is empty (e.g., due to a 204 No Content response),
          // set the status to 'nocontent'.
          if (!isXml && (doc.body === null || doc.body.innerHTML === '')) {
            status = 'nocontent';
            log('response body is empty');
          }
          else {
            // Get the iframe's document location (important for detecting redirects).
            var docLocation = io.contentWindow.location.href;
            if (s.dataType == 'text' && docLocation.indexOf('about:blank') === -1) {
              // If `dataType` is 'text' and not `about:blank`, assume a redirect.
              // This is a hack for file uploads in IE that return text/html.
              // (Thanks to Brian Griffen for this insight).
              data = io.contentWindow.document.body.innerHTML;
              callbackProcessed = true; // Mark as processed to prevent re-entry.
              xhr.responseText = data;
            }
            else if (isXml) {
              // If the response is XML, store it in `xhr.responseXML`.
              xhr.responseXML = doc;
            }
            else {
              // Otherwise, assume text/HTML response and get the content.
              xhr.responseText = doc.body ? doc.body.innerHTML : null;
            }

            // If `dataType` is 'script', execute the script content.
            if (s.dataType == 'script') {
              var ta = doc.createElement('textarea');
              ta.id = 'temp' + (new Date().getTime());
              // Use setTimeout to ensure script execution is asynchronous.
              doc.body.appendChild(ta);
              ta.innerHTML = xhr.responseText;
              var script = doc.createElement('script');
              script.text = 'jQuery(function($){jQuery("#' + ta.id + '").remove();' + ta.value + '});';
              doc.body.appendChild(script);
              callbackProcessed = true;
            }
          }
        }
        catch(ex) {
          log('error caught: ', ex);
          status = 'error';
          xhr.error = errMsg = (ex || status);
        }

        // If the callback was not yet processed and not aborted,
        // process the response data.
        if (xhr.aborted || callbackProcessed) {
          log('callback processed, no further action');
          return;
        }

        // If the `s.data` (form data) was nullified for the request,
        // restore it for potential subsequent use.
        if (options.data) {
          options.data = options.extraData;
        }

        // Trigger global AJAX events (`ajaxSuccess`, `ajaxComplete`, `ajaxError`).
        if (s.success) {
          s.success.call(s.context, data, status, xhr);
        }
        if (s.complete) {
          s.complete.call(s.context, xhr, status);
        }
        if (g && !--$.active) {
          $.event.trigger("ajaxStop");
        }
        if (g) {
          $.event.trigger("ajaxComplete", [xhr, s]);
        }

        // Clean up the iframe if it was dynamically created.
        if (s.iframeTarget) {
          $io.removeAttr('name').addClass('hidden');
        } else {
          $io.remove();
        }
        xhr.responseXML = null; // Clear reference to avoid memory leaks.
      }
    }
  };


  /**
   * Extends jQuery's prototype with the `ajaxForm` function.
   * This function sets up a form for AJAX submission, binding to the submit event.
   *
   * @param {Object} options - Configuration options for the AJAX form.
   * @returns {jQuery} The jQuery object, allowing for method chaining.
   */
  $.fn.ajaxForm = function(options) {
    options = options || {};
    options.delegation = options.delegation && $.isFunction($.fn.on);

    // If delegation is enabled (jQuery 1.7+), use `on()` for event binding.
    if (!options.delegation && this.length === 0) {
      var o = { s: this.selector, c: this.context };
      if (!$.isReady && o.c) {
        log('DOM not ready, queuing ajaxForm');
        $(function() {
          $(o.s, o.c).ajaxForm(options);
        });
        return this;
      }
      log('terminating, no matching elements');
      return this;
    }

    // Iterate over each selected form element.
    return this.ajaxFormUnbind().bind('submit.form', function(e) {
      var form = this;
      if (e.isDefaultPrevented()) {
        return; // If default action prevented, do nothing.
      }

      // If delegation is enabled, check if the event target is the form itself.
      if (options.delegation) {
        if (!$(e.target).is(form)) {
          return; // Event originated from a child element, not the form.
        }
      }

      // If an `beforeSubmit` callback is provided, invoke it.
      // If it returns `false`, prevent default submission.
      var opts = $.extend(true, {}, options);
      if (opts.validate && !opts.validate.call(form, e, opts)) {
        return false;
      }

      var sub = $(e.target).closest('input[type=submit],button[type=submit]');
      if (sub.length) {
        opts.extraData = opts.extraData || {};
        opts.extraData[sub.attr('name')] = sub.val();
      }

      // If `options.iframe` is explicitly set to `false`, disable it.
      if (opts.iframe === false) {
        opts.iframe = false;
      }

      // Call `ajaxSubmit` to perform the actual AJAX submission.
      $(form).ajaxSubmit(opts);
      return false; // Prevent default form submission.
    }).each(function() {
      // Store options on the form itself for later retrieval.
      $(this).data('ajaxFormOptions', options);
    });
  };


  /**
   * Extends jQuery's prototype with `ajaxFormUnbind`.
   * This function unbinds the `submit.form` event handler previously attached by `ajaxForm`.
   *
   * @returns {jQuery} The jQuery object, allowing for method chaining.
   */
  $.fn.ajaxFormUnbind = function() {
    return this.unbind('submit.form');
  };


  /**
   * Extends jQuery's prototype with `formToArray`.
   * This function serializes the form data into an array of name-value pairs.
   *
   * @param {boolean} semantic - If true, only inputs with names will be included.
   * @returns {Array} An array of objects, each with 'name' and 'value' properties.
   */
  $.fn.formToArray = function(semantic) {
    var a = [];
    if (this.length === 0) {
      return a; // Return empty array if no form elements are selected.
    }

    var form = this[0];
    var els = semantic ? form.getElementsByTagName('*') : form.elements;
    if (!els) {
      return a;
    }

    // Iterate over each form element.
    for (var i = 0, max = els.length; i < max; i++) {
      var el = els[i];
      var n = el.name;
      if (!n) {
        continue; // Skip elements without a name.
      }

      // If `semantic` is true, only include elements that are not disabled
      // and have a name.
      if (semantic && form.clk && el.type == 'image') {
        // If an image input was clicked, only include it if it's the clicked one.
        if (!el.disabled && form.clk == el) {
          a.push({ name: n, value: $(el).val(), type: el.type });
          a.push({ name: n + '.x', value: form.clk_x });
          a.push({ name: n + '.y', value: form.clk_y });
        }
        continue;
      }

      var v = $.fieldValue(el, true); // Get the field's value.
      if (v && v.constructor == Array) {
        // If the value is an array (e.g., from multi-select), add each item separately.
        for (var j = 0, jmax = v.length; j < jmax; j++) {
          a.push({ name: n, value: v[j] });
        }
      }
      else if (v !== null && typeof v != 'undefined') {
        // For single values, add directly.
        a.push({ name: n, value: v });
      }
    }

    // If a submit element was clicked, and it's not an image input,
    // ensure its value is included.
    if (!semantic && form.clk) {
      var $clk = $(form.clk), clk_n = $clk.attr('name');
      if (clk_n && !form.clk.disabled && form.clk.type != 'image') {
        a.push({ name: clk_n, value: $clk.val() });
      }
    }
    return a;
  };


  /**
   * Extends jQuery's prototype with `formSerialize`.
   * This function serializes the form data into a URL-encoded string.
   *
   * @param {boolean} semantic - If true, only inputs with names will be included.
   * @returns {string} The URL-encoded query string.
   */
  $.fn.formSerialize = function(semantic) {
    // Invoke `formToArray` and then `$.param` to get the serialized string.
    return $.param(this.formToArray(semantic));
  };


  /**
   * Extends jQuery's prototype with `fieldSerialize`.
   * This function serializes a single field's data into a URL-encoded string.
   *
   * @param {boolean} successful - If true, only "successful" controls are serialized.
   * @returns {string} The URL-encoded query string for the field.
   */
  $.fn.fieldSerialize = function(successful) {
    var a = [];
    this.each(function() {
      var n = this.name;
      if (!n) {
        return; // Skip elements without a name.
      }
      var v = $.fieldValue(this, successful);
      if (v && v.constructor == Array) {
        for (var i = 0, max = v.length; i < max; i++) {
          a.push({ name: n, value: v[i] });
        }
      }
      else if (v !== null && typeof v != 'undefined') {
        a.push({ name: this.name, value: v });
      }
    });
    return $.param(a);
  };


  /**
   * Extends jQuery's prototype with `fieldValue`.
   * This function retrieves the value of a single form field.
   *
   * @param {boolean} successful - If true, only "successful" controls (not disabled, checked, etc.) are considered.
   * @returns {string|Array|null} The field's value, or an array of values for multi-selects, or null.
   */
  $.fn.fieldValue = function(successful) {
    for (var val = [], i = 0, max = this.length; i < max; i++) {
      var el = this[i];
      var v = $.fieldValue(el, successful);
      if (v === null || typeof v == 'undefined' || (v.constructor == Array && !v.length)) {
        continue; // Skip if value is null, undefined, or an empty array.
      }
      if (v.constructor == Array) {
        $.merge(val, v); // Merge array values.
      } else {
        val.push(v); // Push single value.
      }
    }
    return val;
  };


  /**
   * Extends jQuery's prototype with `clearForm`.
   * This function clears the value of all input, textarea, and select fields in the form.
   *
   * @param {boolean} includeHidden - If true, hidden fields will also be cleared.
   * @returns {jQuery} The jQuery object, allowing for method chaining.
   */
  $.fn.clearForm = function(includeHidden) {
    return this.each(function() {
      $('input,select,textarea', this).clearFields(includeHidden);
    });
  };


  /**
   * Extends jQuery's prototype with `clearFields`.
   * This function clears the value of selected input, textarea, and select fields.
   *
   * @param {boolean} includeHidden - If true, hidden fields will also be cleared.
   * @returns {jQuery} The jQuery object, allowing for method chaining.
   */
  $.fn.clearFields = $.fn.clearInputs = function(includeHidden) {
    var re = /^(?:color|date|datetime|email|month|number|password|range|search|tel|text|time|url|week)$/i; // Input types to clear.
    return this.each(function() {
      var t = this.type, tag = this.tagName.toLowerCase();
      if (re.test(t) || tag == 'textarea') {
        this.value = ''; // Clear text-based inputs and textareas.
      }
      else if (t == 'checkbox' || t == 'radio') {
        this.checked = false; // Uncheck checkboxes and radio buttons.
      }
      else if (tag == 'select') {
        this.selectedIndex = -1; // Deselect all options in a select box.
      }
      else if (includeHidden && t == 'hidden') {
        this.value = ''; // Clear hidden inputs if `includeHidden` is true.
      }
    });
  };


  /**
   * Extends jQuery's prototype with `resetForm`.
   * This function resets all form fields to their initial values.
   *
   * @returns {jQuery} The jQuery object, allowing for method chaining.
   */
  $.fn.resetForm = function() {
    return this.each(function() {
      // `reset()` is a native DOM method that resets form fields.
      if (typeof this.reset == 'function' || (typeof this.reset == 'object' && !this.reset.nodeType)) {
        this.reset();
      }
    });
  };


  /**
   * Extends jQuery's prototype with `enable`.
   * This function enables all selected form elements.
   *
   * @returns {jQuery} The jQuery object, allowing for method chaining.
   */
  $.fn.enable = function(enable) {
    if (enable === undefined) {
      enable = true; // Default to enabling elements.
    }
    return this.each(function() {
      this.disabled = !enable; // Set `disabled` property based on `enable` flag.
    });
  };


  /**
   * Extends jQuery's prototype with `disable`.
   * This function disables all selected form elements.
   *
   * @returns {jQuery} The jQuery object, allowing for method chaining.
   */
  $.fn.disable = function() {
    return this.each(function() {
      this.disabled = true; // Set `disabled` property to true.
    });
  };


  /**
   * Extends jQuery's prototype with `selected`.
   * This function sets the `selected` property of options within select elements.
   *
   * @param {boolean} select - If true, options are selected; if false, they are deselected.
   * @returns {jQuery} The jQuery object, allowing for method chaining.
   */
  $.fn.selected = function(select) {
    if (select === undefined) {
      select = true; // Default to selecting elements.
    }
    return this.each(function() {
      var t = this.type;
      if (t == 'checkbox' || t == 'radio') {
        this.checked = select; // Set `checked` for checkboxes/radios.
      } else if (this.tagName.toLowerCase() == 'option') {
        this.selected = select; // Set `selected` for options.
      }
    });
  };


  /**
   * `$.fieldValue` (static method).
   * This is a utility function to get the value of a single form element.
   * It handles various input types and their 'successful' submission criteria.
   *
   * @param {HTMLElement} el - The DOM element (input, select, textarea).
   * @param {boolean} successful - If true, only "successful" controls are considered.
   * @returns {string|Array|null} The field's value, or an array of values, or null.
   */
  $.fieldValue = function(el, successful) {
    var n = el.name, t = el.type, tag = el.tagName.toLowerCase();
    if (successful === undefined) {
      successful = true; // Default to successful submission logic.
    }

    // Skip disabled elements if `successful` is true.
    if (successful && (!n || el.disabled || t == 'reset' || t == 'button' ||
                       (t == 'checkbox' || t == 'radio') && !el.checked ||
                       (t == 'submit' || t == 'image') && el.form && el.form.clk != el)) {
      return null;
    }

    if (tag == 'select') {
      var index = el.selectedIndex;
      if (index < 0) {
        return null; // No option selected.
      }
      var a = [], ops = el.options;
      var one = (t == 'select-one'); // True for single-select, false for multi-select.
      var val = (one ? ops[index].value : null);
      for (var i = 0, max = ops.length; i < max; i++) {
        if (ops[i].selected) {
          val = ops[i].value;
          if (one) {
            return val; // For single-select, return first selected value.
          }
          a.push(val); // For multi-select, collect all selected values.
        }
      }
      return a; // Return array for multi-select.
    }
    return $(el).val(); // For other input types, use jQuery's `.val()`.
  };


  /**
   * Helper function for logging messages to the console if available.
   * This is used internally for debugging and informational messages.
   *
   * @param {...*} args - Arguments to be logged.
   */
  var log = $.fn.ajaxSubmit.log = function() {
    // Check if the console object and its `log` method are available.
    if (window.console && window.console.log) {
      window.console.log('[jquery.form] ', arguments);
    }
  };

})(jQuery); // Pass jQuery to the anonymous function.