define("ocean/Ocean-UI-Auth", ["aquamarine_vm/tinyTalk", "aquamarine_vm/none", "aquamarine_vm/_tt", "aquamarine_vm/universal", "ocean/Ocean-UI-Base"], function(tinyTalk, none, _tt, universal){

  // Initialize the authentication package
  tinyTalk.addPackage('Ocean-UI-Auth');
  // Configure AMD transport for the package
  tinyTalk.packages["Ocean-UI-Auth"].transport = {"type":"amd","amdNamespace":"ocean"};

  // Define the base abstract authentication component
  tinyTalk.addClass('OceAbstractAuthComponent', universal.OceFrameComponent, ['messageZone', 'successCallback', 'coordinator'], 'Ocean-UI-Auth');

  // Method to handle successful authentication
  tinyTalk.addMethod(
    tinyTalk.method({
      selector: "onSuccess:",
      protocol: 'handlers',
      fn: function (aUserObj){
        var instance = this;
        return tinyTalk.withContext(function(_ctx1) {
          var _target;
          // Check if the user object is valid
          if((_target = aUserObj) === null || _target.isNil){
            aUserObj;
          } else {
            instance._dispose(); // Remove component from view
            _tt(instance._successCallback())._execute();
          };
          return instance;
        }, function(_ctx1) {_ctx1.fill(instance,"onSuccess:",{aUserObj:aUserObj},universal.OceAbstractAuthComponent)})},
      args: ["aUserObj"],
      source: "onSuccess: aUserObj\x0a\x09aUserObj ifPresent: [\x0a\x09\x09instance dispose.\x0a\x09\x09instance successCallback execute ]",
      messageSends: ["ifPresent:", "dispose", "execute", "successCallback"],
      referencedClasses: []
    }),
    universal.OceAbstractAuthComponent);

  // Retrieves the block for successful login handling
  tinyTalk.addMethod(
    tinyTalk.method({
      selector: "successCallback",
      protocol: 'getters',
      fn: function (){
        var instance = this;
        return tinyTalk.withContext(function(_ctx1) {
          var _val2,_val1,_target;
          _val2 = instance["@successCallback"];
          // If callback is not set, return an empty function
          if((_target = _val2) === null || _target.isNil){
            _val1 = (new Function());
          } else {
            _val1 = _val2;
          };
          return _val1;
        }, function(_ctx1) {_ctx1.fill(instance,"successCallback",{},universal.OceAbstractAuthComponent)})},
      args: [],
      source: "successCallback\x0a\x09^ successCallback ifAbsent: [ new Function() ]",
      messageSends: ["ifAbsent:"],
      referencedClasses: []
    }),
    universal.OceAbstractAuthComponent);

  // Sets the callback function for successful authentication
  tinyTalk.addMethod(
    tinyTalk.method({
      selector: "successCallback:",
      protocol: 'setters',
      fn: function (aFunc){
        var instance = this;
        instance["@successCallback"] = aFunc;
        return instance;
      },
      args: ["aFunc"],
      source: "successCallback: aFunc\x0a\x09successCallback := aFunc",
      messageSends: [],
      referencedClasses: []
    }),
    universal.OceAbstractAuthComponent);

  // Displays an error message for authentication failures
  tinyTalk.addMethod(
    tinyTalk.method({
      selector: "onError:",
      protocol: 'error_management',
      fn: function (anIssue){
        var instance = this;
        return tinyTalk.withContext(function(_ctx1) {
          var _val1,_val2,_val3;
          _val1 = _tt(instance["@messageZone"])._toJQuery();
          _ctx1.sendIdx["toJQuery"]=1;
          _tt(_val1)._clear();
          _tt((function(domBuilder){
            return tinyTalk.withContext(function(_ctx2) {
              _val2 = _tt(domBuilder)._paragraph();
              _tt(_val2)._style_("bg-alert");
              _val3 = _tt(_val2)._include_(_tt(anIssue)._detailMessage());
              return _val3;
            }, function(_ctx2) {_ctx2.fillBlock({domBuilder:domBuilder},_ctx1,1)})}))._attachToJQuery_(_tt(instance["@messageZone"])._toJQuery());
          return instance;
        }, function(_ctx1) {_ctx1.fill(instance,"onError:",{anIssue:anIssue},universal.OceAbstractAuthComponent)})},
      args: ["anIssue"],
      source: "onError: anIssue\x0a\x09messageZone toJQuery clear.\x0a\x09[ :domBuilder | \x0a\x09\x09domBuilder paragraph \x0a\x09\x09\x09style: 'bg-alert';\x0a\x09\x09\x09include: anIssue detailMessage ] attachToJQuery: messageZone toJQuery",
      messageSends: ["clear", "toJQuery", "attachToJQuery:", "style:", "paragraph", "include:", "detailMessage"],
      referencedClasses: []
    }),
    universal.OceAbstractAuthComponent);

  // Retrieves the current coordinator
  tinyTalk.addMethod(
    tinyTalk.method({
      selector: "coordinator",
      protocol: 'getters',
      fn: function (){
        var instance = this;
        var _val1;
        _val1 = instance["@coordinator"];
        return _val1;
      },
      args: [],
      source: "coordinator\x0a\x09^ coordinator",
      messageSends: [],
      referencedClasses: []
    }),
    universal.OceAbstractAuthComponent);

  // Sets the component's coordinator
  tinyTalk.addMethod(
    tinyTalk.method({
      selector: "coordinator:",
      protocol: 'setters',
      fn: function (aCoord){
        var instance = this;
        instance["@coordinator"] = aCoord;
        return instance;
      },
      args: ["aCoord"],
      source: "coordinator: aCoord\x0a\x09coordinator := aCoord",
      messageSends: [],
      referencedClasses: []
    }),
    universal.OceAbstractAuthComponent);

  // Renders the main content of the authentication component
  tinyTalk.addMethod(
    tinyTalk.method({
      selector: "composeViewOn:",
      protocol: 'view_composition',
      fn: function (domBuilder){
        var instance = this;
        return tinyTalk.withContext(function(_ctx1) {
          var _val1,_val3,_val5,_val7,_val8,_val6,_val4,_val2;
          _val1 = _tt(domBuilder)._division();
          _ctx1.sendIdx["division"]=1;
          _tt(_val1)._style_("flex-container");
          _ctx1.sendIdx["style:"]=1;
          _val2 = _tt(_val1)._include_((function(){
            return tinyTalk.withContext(function(_ctx2) {
              _val3 = _tt(domBuilder)._division();
              _ctx2.sendIdx["division"]=2;
              _tt(_val3)._style_("flex-row");
              _ctx2.sendIdx["style:"]=2;
              _val4 = _tt(_val3)._include_((function(){
                return tinyTalk.withContext(function(_ctx3) {
                  _val5 = _tt(domBuilder)._division();
                  _ctx3.sendIdx["division"]=3;
                  _tt(_val5)._style_("col-full col-md-third col-md-offset-third");
                  _ctx3.sendIdx["style:"]=3;
                  _val6 = _tt(_val5)._include_((function(){
                    return tinyTalk.withContext(function(_ctx4) {
                      _val7 = _tt(domBuilder)._division();
                      _tt(_val7)._style_("auth-panel");
                      _val8 = _tt(_val7)._include_((function(){
                        return tinyTalk.withContext(function(_ctx5) {
                          instance._composeHeaderOn_(domBuilder);
                          instance._composeErrorOn_(domBuilder);
                          return instance._composeFormOn_(domBuilder);
                        }, function(_ctx5) {_ctx5.fillBlock({},_ctx4,4)})}));
                      return _val8;
                    }, function(_ctx4) {_ctx4.fillBlock({},_ctx3,3)})}));
                  _ctx3.sendIdx["include:"]=3;
                  return _val6;
                }, function(_ctx3) {_ctx3.fillBlock({},_ctx2,2)})}));
              _ctx2.sendIdx["include:"]=2;
              return _val4;
            }, function(_ctx2) {_ctx2.fillBlock({},_ctx1,1)})}));
          _ctx1.sendIdx["include:"]=1;
          return instance;
        }, function(_ctx1) {_ctx1.fill(instance,"composeViewOn:",{domBuilder:domBuilder},universal.OceAbstractAuthComponent)})},
      args: ["domBuilder"],
      source: "composeViewOn: domBuilder\x0a\x09domBuilder division \x0a\x09\x09style: 'flex-container';\x0a\x09\x09include: [\x0a\x09\x09\x09domBuilder division \x0a\x09\x09\x09\x09style: 'flex-row';\x0a\x09\x09\x09\x09include: [ \x0a\x09\x09\x09\x09\x09domBuilder division \x0a\x09\x09\x09\x09\x09\x09style: 'col-full col-md-third col-md-offset-third';\x0a\x09\x09\x09\x09\x09\x09include: [ \x0a\x09\x09\x09\x09\x09\x09\x09domBuilder division \x0a\x09\x09\x09\x09\x09\x09\x09\x09style: 'auth-panel'; \x0a\x09\x09\x09\x09\x09\x09\x09\x09include: [\x0a\x09\x09\x09\x09\x09\x09\x09\x09\x09instance composeHeaderOn: domBuilder.\x0a\x09\x09\x09\x09\x09\x09\x09\x09\x09instance composeErrorOn: domBuilder.\x0a\x09\x09\x09\x09\x09\x09\x09\x09\x09instance composeFormOn: domBuilder ] ] ] ]",
      messageSends: ["style:", "division", "include:", "composeHeaderOn:", "composeErrorOn:", "composeFormOn:"],
      referencedClasses: []
    }),
    universal.OceAbstractAuthComponent);

  // Renders the error display area
  tinyTalk.addMethod(
    tinyTalk.method({
      selector: "composeErrorOn:",
      protocol: 'view_composition',
      fn: function (domBuilder){
        var instance = this;
        return tinyTalk.withContext(function(_ctx1) {
          instance["@messageZone"] = _tt(_tt(domBuilder)._division())._style_("auth-messages");
          return instance;
        }, function(_ctx1) {_ctx1.fill(instance,"composeErrorOn:",{domBuilder:domBuilder},universal.OceAbstractAuthComponent)})},
      args: ["domBuilder"],
      source: "composeErrorOn: domBuilder\x0a\x09messageZone := domBuilder division style: 'auth-messages'.",
      messageSends: ["style:", "division"],
      referencedClasses: []
    }),
    universal.OceAbstractAuthComponent);

  // Placeholder for rendering the authentication form, must be overridden
  tinyTalk.addMethod(
    tinyTalk.method({
      selector: "composeFormOn:",
      protocol: 'view_composition',
      fn: function (domBuilder){
        var instance = this;
        return tinyTalk.withContext(function(_ctx1) {
          instance._mustImplement();
          return instance;
        }, function(_ctx1) {_ctx1.fill(instance,"composeFormOn:",{domBuilder:domBuilder},universal.OceAbstractAuthComponent)})},
      args: ["domBuilder"],
      source: "composeFormOn: domBuilder\x0a\x09instance mustImplement",
      messageSends: ["mustImplement"],
      referencedClasses: []
    }),
    universal.OceAbstractAuthComponent);

  // Renders the header section of the component
  tinyTalk.addMethod(
    tinyTalk.method({
      selector: "composeHeaderOn:",
      protocol: 'view_composition',
      fn: function (domBuilder){
        var instance = this;
        return tinyTalk.withContext(function(_ctx1) {
          var _val1,_val2;
          _tt(_tt(domBuilder)._heading1())._include_((function(){
            return tinyTalk.withContext(function(_ctx2) {
              _val1 = _tt(domBuilder)._spanElement();
              _ctx2.sendIdx["spanElement"]=1;
              _tt(_val1)._style_("brand-icon");
              _ctx2.sendIdx["style:"]=1;
              _val2 = _tt(_val1)._include_((function(){
                return tinyTalk.withContext(function(_ctx3) {
                  _tt(_tt(domBuilder)._spanElement())._style_("icon icon-water");
                  return _tt(domBuilder)._include_(" Ocean");
                }, function(_ctx3) {_ctx3.fillBlock({},_ctx2,2)})}));
              _ctx2.sendIdx["include:"]=2;
              return _val2;
            }, function(_ctx2) {_ctx2.fillBlock({},_ctx1,1)})}));
          _ctx1.sendIdx["include:"]=1;
          return instance;
        }, function(_ctx1) {_ctx1.fill(instance,"composeHeaderOn:",{domBuilder:domBuilder},universal.OceAbstractAuthComponent)})},
      args: ["domBuilder"],
      source: "composeHeaderOn: domBuilder\x0a\x09domBuilder heading1 include: [\x0a\x09\x09domBuilder spanElement \x0a\x09\x09\x09style: 'brand-icon';\x0a\x09\x09\x09include: [\x0a\x09\x09\x09\x09domBuilder spanElement style: 'icon icon-water'.\x0a\x09\x09\x09\x09domBuilder include: ' Ocean' ] ]",
      messageSends: ["include:", "heading1", "style:", "spanElement"],
      referencedClasses: []
    }),
    universal.OceAbstractAuthComponent);


  // Defines a concrete authentication component using WebID (formerly Mozilla Persona)
  tinyTalk.addClass('OceWebIDAuthComponent', universal.OceAbstractAuthComponent, [], 'Ocean-UI-Auth');

  // Initiates the authentication process with a given token
  tinyTalk.addMethod(
    tinyTalk.method({
      selector: "authenticate:",
      protocol: 'operations',
      fn: function (token){
        var instance = this;
        return tinyTalk.withContext(function(_ctx1) {
          var _val1,_val2;
          _tt((function(){
            return tinyTalk.withContext(function(_ctx2) {
              _val1 = instance._coordinator();
              _ctx2.sendIdx["coordinator"]=1;
              _tt(_val1)._verifyWebIDToken_(token);
              _val2 = _tt(_val1)._andThen_((function(){
                return tinyTalk.withContext(function(_ctx3) {
                  return instance._onSuccess_(_tt(instance._coordinator())._activeUser());
                }, function(_ctx3) {_ctx3.fillBlock({},_ctx2,2)})}));
              return _val2;
            }, function(_ctx2) {_ctx2.fillBlock({},_ctx1,1)})}))._handlePromiseRejection_((function(fault){
            return tinyTalk.withContext(function(_ctx2) {
              return instance._onError_(fault);
            }, function(_ctx2) {_ctx2.fillBlock({fault:fault},_ctx1,3)})}));
          return instance;
        }, function(_ctx1) {_ctx1.fill(instance,"authenticate:",{token:token},universal.OceWebIDAuthComponent)})},
      args: ["token"],
      source: "authenticate: token\x0a\x09[ instance coordinator\x0a\x09\x09verifyWebIDToken: token;\x0a\x09\x09andThen: [ instance onSuccess: instance coordinator activeUser ]\x0a\x09] handlePromiseRejection: [ :fault | \x0a\x09\x09instance onError: fault ]",
      messageSends: ["handlePromiseRejection:", "verifyWebIDToken:", "coordinator", "andThen:", "onSuccess:", "activeUser", "onError:"],
      referencedClasses: []
    }),
    universal.OceWebIDAuthComponent);

  // Triggers the WebID authentication flow
  tinyTalk.addMethod(
    tinyTalk.method({
      selector: "authenticateWithWebID",
      protocol: 'operations',
      fn: function (){
        var instance = this;
        return tinyTalk.withContext(function(_ctx1) {
          _tt(_tt(window.identity)._identification())._prompt();
          return instance;
        }, function(_ctx1) {_ctx1.fill(instance,"authenticateWithWebID",{},universal.OceWebIDAuthComponent)})},
      args: [],
      source: "authenticateWithWebID\x0a\x09window identity identification prompt",
      messageSends: ["prompt", "identification"],
      referencedClasses: []
    }),
    universal.OceWebIDAuthComponent);

  // Handles user sign out
  tinyTalk.addMethod(
    tinyTalk.method({
      selector: "signOut",
      protocol: 'operations',
      fn: function (){
        var instance = this;
        return instance;
      },
      args: [],
      source: "signOut\x0a\x09",
      messageSends: [],
      referencedClasses: []
    }),
    universal.OceWebIDAuthComponent);

  // Composes the WebID authentication form
  tinyTalk.addMethod(
    tinyTalk.method({
      selector: "composeFormOn:",
      protocol: 'view_composition',
      fn: function (domBuilder){
        var instance = this;
        return tinyTalk.withContext(function(_ctx1) {
          var _val1,_val3,_val4,_val2;
          instance._initializeWebID();
          _tt(_tt(domBuilder)._formElement())._include_((function(){
            return tinyTalk.withContext(function(_ctx2) {
              _val1 = _tt(domBuilder)._division();
              _tt(_val1)._style_("input-group");
              _ctx2.sendIdx["style:"]=1;
              _val2 = _tt(_val1)._include_((function(){
                return tinyTalk.withContext(function(_ctx3) {
                  _val3 = _tt(domBuilder)._buttonElement();
                  _tt(_val3)._style_("button button-primary webid_auth");
                  _tt(_val3)._kind_("action");
                  _val4 = _tt(_val3)._onPress_((function(evt){
                    return tinyTalk.withContext(function(_ctx4) {
                      _tt(evt)._haltDefault();
                      return instance._authenticateWithWebID();
                    }, function(_ctx4) {_ctx4.fillBlock({evt:evt},_ctx3,3)})}));
                  return _val4;
                }, function(_ctx3) {_ctx3.fillBlock({},_ctx2,2)})}));
              return _val2;
            }, function(_ctx2) {_ctx2.fillBlock({},_ctx1,1)})}));
          _ctx1.sendIdx["include:"]=1;
          return instance;
        }, function(_ctx1) {_ctx1.fill(instance,"composeFormOn:",{domBuilder:domBuilder},universal.OceWebIDAuthComponent)})},
      args: ["domBuilder"],
      source: "composeFormOn: domBuilder\x0a\x09instance initializeWebID.\x0a\x09domBuilder formElement include: [\x0a\x09\x09domBuilder division \x0a\x09\x09\x09style: 'input-group';\x0a\x09\x09\x09include: [\x0a\x09\x09\x09\x09domBuilder buttonElement\x0a\x09\x09\x09\x09\x09style: 'button button-primary webid_auth';\x0a\x09\x09\x09\x09\x09kind: 'action';\x0a\x09\x09\x09\x09\x09onPress: [ :evt | \x0a\x09\x09\x09\x09\x09\x09evt haltDefault.\x0a\x09\x09\x09\x09\x09\x09instance authenticateWithWebID ] ] ]",
      messageSends: ["initializeWebID", "include:", "formElement", "style:", "division", "buttonElement", "kind:", "onPress:", "haltDefault", "authenticateWithWebID"],
      referencedClasses: []
    }),
    universal.OceWebIDAuthComponent);

  // Configures the WebID authentication listener
  tinyTalk.addMethod(
    tinyTalk.method({
      selector: "initializeWebID",
      protocol: 'configuration',
      fn: function (){
        var instance = this;
        return tinyTalk.withContext(function(_ctx1) {
          var _val1;
          _val1 = _tt(window.identity)._identification();
          _ctx1.sendIdx["identification"]=1;
          _tt(_val1)._signOut();
          _ctx1.sendIdx["signOut"]=1;
          _tt(_tt(window.identity)._identification())._monitor_( // Watch for WebID events
            universal.AssociativeCollection._fromKeyValues_(["activeUser",Boolean.FALSE,"onAuth",(function(token){
              return tinyTalk.withContext(function(_ctx2) {
                return instance._authenticate_(token);
              }, function(_ctx2) {_ctx2.fillBlock({token:token},_ctx1,1)})}),"onSignOut",(function(){
              return tinyTalk.withContext(function(_ctx2) {
                return instance._signOut();
              }, function(_ctx2) {_ctx2.fillBlock({},_ctx1,2)})})]));
          return instance;
        }, function(_ctx1) {_ctx1.fill(instance,"initializeWebID",{},universal.OceWebIDAuthComponent)})},
      args: [],
      source: "initializeWebID\x0a\x09window identity identification signOut.\x0a\x09window identity identification monitor: #{\x0a\x09\x09'activeUser' -> Boolean.FALSE.\x0a\x09\x09'onAuth' -> [ :token | instance authenticate: token ].\x0a\x09\x09'onSignOut' -> [ instance signOut ]\x0a\x09}",
      messageSends: ["signOut", "identification", "monitor:", "authenticate:"],
      referencedClasses: []
    }),
    universal.OceWebIDAuthComponent);

});