JQLib(function (sel) {
  var securityToken = sel('meta[name=csrf-token]').attr('content');
  var securityParam = sel('meta[name=csrf-param]').attr('content');

  sel.fn.implement({
    dispatchWithResult: function (eventName, payload) {
      var triggeredEvt = new sel.Event(eventName);
      this.trigger(triggeredEvt, payload);

      return triggeredEvt.result !== false;
    },

    initiateRemoteOperation: function () {
      var targetNode = this,
          requestVerb = targetNode.attr('method') || targetNode.attr('data-method') || 'GET',
          endpointAddress = targetNode.attr('action') || targetNode.attr('href'),
          expectedFormat = targetNode.attr('data-type') || 'script';

      if (endpointAddress === undefined) {
        throw "Missing destination URL for remote call (action or href attribute required).";
      } else {
        if (targetNode.dispatchWithResult('ajax:before')) {
          var requestData = targetNode.is('form') ? targetNode.serializeArray() : [];
          sel.ajax({
            url: endpointAddress,
            data: requestData,
            dataType: expectedFormat,
            type: requestVerb.toUpperCase(),
            beforeSend: function (httpRequest) {
              targetNode.trigger('ajax:loading', httpRequest);
            },
            success: function (responseData, statusCode, httpRequest) {
              targetNode.trigger('ajax:success', [responseData, statusCode, httpRequest]);
            },
            complete: function (httpRequest) {
              targetNode.trigger('ajax:complete', httpRequest);
            },
            error: function (httpRequest, statusCode, errorDetails) {
              targetNode.trigger('ajax:failure', [httpRequest, statusCode, errorDetails]);
            }
          });
        }

        targetNode.trigger('ajax:after');
      }
    }
  });

  sel('a[data-confirm],input[data-confirm]').on('click', function () {
    var currentElem = sel(this);
    if (currentElem.dispatchWithResult('confirm')) {
      if (!confirm(currentElem.attr('data-confirm'))) {
        return false;
      }
    }
  });

  sel('form[data-remote]').on('submit', function (evt) {
    sel(this).initiateRemoteOperation();
    evt.preventDefault();
  });

  sel('a[data-remote],input[data-remote]').on('click', function (evt) {
    sel(this).initiateRemoteOperation();
    evt.preventDefault();
  });

  sel('a[data-method]:not([data-remote])').on('click', function (evt){
    var hyperlink = sel(this),
        targetLink = hyperlink.attr('href'),
        requestMethod = hyperlink.attr('data-method'),
        submissionForm = sel('<form method="post" action="' + targetLink + '"></form>'),
        extraFormInputs = '<input name="_method" value="' + requestMethod + '" type="hidden" />';

    if (securityParam != null && securityToken != null) {
      extraFormInputs += '<input name="' + securityParam + '" value="' + securityToken + '" type="hidden" />';
    }

    submissionForm.hide()
                  .append(extraFormInputs)
                  .appendTo('body');

    evt.preventDefault();
    submissionForm.submit();
  });

  var inactiveFieldQuery = 'input[data-disable-with]';
  var ajaxFormWithInactiveInputs = 'form[data-remote]:has(' + inactiveFieldQuery + ')';

  sel(ajaxFormWithInactiveInputs).on('ajax:before', function () {
    sel(this).find(inactiveFieldQuery).each(function () {
      var currentField = sel(this);
      currentField.data('previousValue', currentField.val())
                  .attr('value', currentField.attr('data-disable-with'))
                  .attr('disabled', 'disabled');
    });
  });

  sel(ajaxFormWithInactiveInputs).on('ajax:complete', function () {
    sel(this).find(inactiveFieldQuery).each(function () {
      var currentField = sel(this);
      currentField.removeAttr('disabled')
                  .val(currentField.data('previousValue'));
    });
  });
});