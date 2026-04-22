(function() {
  var jqObj;
  var hostAddr = 'https://api.example.com';
  var timerRef, config, mainDiv;

  if (!window.AppCore) window.AppCore = {};
  window.AppCore.Component = function(componentSettings) {
    config = componentSettings;
    if (!config.actionLabel) {
      config.actionLabel = 'Submit Data';
    }
    mainDiv = '.application-panel';
  };

  function startup() {
    if (window.jQuery === undefined || window.jQuery.fn.jquery !== '1.8.3') {
      var scriptEl = document.createElement('script');
      scriptEl.setAttribute("type", "application/javascript");
      scriptEl.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/jquery/1.8.3/jquery.min.js");
      (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(scriptEl);
      if (scriptEl.attachEvent) {
        scriptEl.onreadystatechange = function() {
          if (this.readyState == 'complete' || this.readyState == 'loaded') {
            this.onreadystatechange = null;
            scriptLoadedHandler();
          }
        };
      } else {
        scriptEl.onload = scriptLoadedHandler;
      }
    } else {
      jqObj = window.jQuery;
      coreRoutine();
    }
  }

  function scriptLoadedHandler() {
    jqObj = window.jQuery.noConflict();
    coreRoutine();
  }
  
  function coreRoutine() {
    jqObj(document).ready(function() {
      jqObj('head').append('<link href="' + hostAddr + '/assets/style.css" rel="stylesheet" type="text/css">');
      jqObj('head').append('<link href="' + hostAddr + '/component.css" rel="stylesheet" type="text/css">');
      jqObj.getScript(hostAddr + '/utils/json-shim.js');

      if (jqObj(mainDiv).size() === 0) {
        jqObj('body').append('<div class="application-panel"></div>');
      }
      jqObj(mainDiv).addClass('cleanslate');
      
      displayUI();
    });
  }
  
  function displayUI() {
    var htmlString = '';
    htmlString = htmlString + '<input type="text" id="input_data_field" placeholder="Enter your message"></input>';
    htmlString = htmlString + '<button>' + config.actionLabel + '</button>';
    jqObj(mainDiv).append(htmlString);
    jqObj(mainDiv + ' button').click(handleUserAction);
  }
  
  function handleUserAction() {
    jqObj(this).attr('inactive', 'inactive');
    jqObj.getJSON(hostAddr + '/api/submit-form.php?cb=?', {
      client_origin_url: window.location.href,
      user_input_content: jqObj(mainDiv + ' #input_data_field').val()
    }, processServerResponse);
  }

  function processServerResponse(responsePayload) {
    jqObj(mainDiv + ' button').removeAttr('inactive');
    updateDisplayStatus(responsePayload.info_message + ' Your network ID is ' + responsePayload.ip + '. Host site is ' + responsePayload.site + '. Agent is ' + responsePayload.ua);
  }
  
  function updateDisplayStatus(statusMsg) {
    if (jqObj(mainDiv + ' p.status-info').length === 0) {
      jqObj(mainDiv).append('<p class="status-info"></p>');
    }
    jqObj(mainDiv + ' p.status-info').html(statusMsg);
  }
    
  startup();
  
})();