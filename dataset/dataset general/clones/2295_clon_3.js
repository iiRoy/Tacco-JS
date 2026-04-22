define("authentication/PersonaAuthModule", ["core_runtime/smalltalk_emulator", "core_runtime/null_object", "core_runtime/st_utilities", "core_runtime/app_context", "shared_components/BaseFrame"], function(jsKernel,nullObject,execSt,globalRefs){
// This module provides authentication widgets for an application.
// It relies on a custom Smalltalk-like JavaScript runtime environment.

jsKernel.addPackage('Authentication-Widgets');
jsKernel.packages["Authentication-Widgets"].transport = {"type":"amd","amdNamespace":"authentication"};

// Base component for any authentication-related UI.
// It provides common error handling, success callbacks, and a presenter interface.
jsKernel.addClass('AppAuthBaseComponent', globalRefs.BaseFrame, ['problemContainerElement', 'postAuthAction', 'authenticationService'], 'Authentication-Widgets');

jsKernel.addMethod(
jsKernel.method({
selector: "processUserSession:",
protocol: 'auth-management',
fn: function (authenticatedUser){
    var selfReference=this; // Renamed 'self'
    return jsKernel.withContext(function($ctx1) {
        // Only proceed if a valid user object is provided.
        if (authenticatedUser === nullObject || authenticatedUser === undefined || execSt(authenticatedUser)._isNil()) {
            console.warn("Attempted to process a null or undefined user session.");
            return selfReference; // Early exit
        }

        // If user is valid, remove the login component and execute the post-authentication callback.
        selfReference._deactivateView();
        execSt(selfReference._getPostAuthAction())._value();
        return selfReference;
    }, function($ctx1) {$ctx1.fill(selfReference,"processUserSession:",{authenticatedUser:authenticatedUser},globalRefs.AppAuthBaseComponent)})
},
args: ["authenticatedUser"],
source: "processUserSession: authenticatedUser\x0a\x09authenticatedUser ifNotNil: [\x0a\x09\x09selfReference deactivateView.\x0a\x09\x09selfReference getPostAuthAction value ]", // Source comment updated
messageSends: ["ifNotNil:", "deactivateView", "value", "getPostAuthAction"],
referencedClasses: []
}),
globalRefs.AppAuthBaseComponent);

jsKernel.addMethod(
jsKernel.method({
selector: "getPostAuthAction",
protocol: 'property-access',
fn: function (){
    var selfReference=this;
    return jsKernel.withContext(function($ctx1) {
        var $result,$storedBlock,$receiver;
        $storedBlock=selfReference["@postAuthAction"];
        // Ensure a default empty block if none is set.
        if(($receiver = $storedBlock) == null || $receiver.isNil){
            $result=(function(){
                // Default block: do nothing.
                console.log("No specific post-auth action defined. Proceeding silently.");
            });
        } else {
            $result=$storedBlock;
        }
        return $result;
    }, function($ctx1) {$ctx1.fill(selfReference,"getPostAuthAction",{},globalRefs.AppAuthBaseComponent)})
},
args: [],
source: "getPostAuthAction\x0a\x09^ postAuthAction ifNil: [ [] ]",
messageSends: ["ifNil:"],
referencedClasses: []
}),
globalRefs.AppAuthBaseComponent);

jsKernel.addMethod(
jsKernel.method({
selector: "setPostAuthAction:",
protocol: 'property-access',
fn: function (aCallbackBlock){
    var selfReference=this;
    selfReference["@postAuthAction"]=aCallbackBlock;
    return selfReference
},
args: ["aCallbackBlock"],
source: "setPostAuthAction: aCallbackBlock\x0a\x09postAuthAction := aCallbackBlock",
messageSends: [],
referencedClasses: []
}),
globalRefs.AppAuthBaseComponent);

jsKernel.addMethod(
jsKernel.method({
selector: "displayAuthError:",
protocol: 'error-handling',
fn: function (authIssue){
    var selfReference=this;
    return jsKernel.withContext(function($ctx1) {
        var $elem1,$elem2,$elem3,$currentErrorContainer;

        // Clear any previous error messages.
        $currentErrorContainer = execSt(selfReference["@problemContainerElement"])._asJQuery();
        execSt($currentErrorContainer)._empty();

        // Construct and append the new error message.
        execSt((function(htmlBuilder){
            return jsKernel.withContext(function($ctx2) {
                $elem1=execSt(htmlBuilder)._div(); // Changed from p to div
                execSt($elem1)._class_("alert alert-danger auth-error-message"); // Changed class name
                $elem3=execSt($elem1)._with_(execSt(authIssue)._messageText());
                console.error("Authentication Error:", execSt(authIssue)._messageText()); // Added console log
                return $elem3;
            }, function($ctx2) {$ctx2.fillBlock({htmlBuilder:htmlBuilder},$ctx1,1)})
        }))._appendToJQuery_($currentErrorContainer); // Reused $currentErrorContainer

        return selfReference;
    }, function($ctx1) {$ctx1.fill(selfReference,"displayAuthError:",{authIssue:authIssue},globalRefs.AppAuthBaseComponent)})
},
args: ["authIssue"],
source: "displayAuthError: authIssue\x0a\x09problemContainerElement asJQuery empty.\x0a\x09[ :htmlBuilder | \x0a\x09\x09htmlBuilder div \x0a\x09\x09\x09class: 'alert alert-danger auth-error-message';\x0a\x09\x09\x09with: authIssue messageText ] appendToJQuery: problemContainerElement asJQuery",
messageSends: ["empty", "asJQuery", "appendToJQuery:", "class:", "div", "with:", "messageText"],
referencedClasses: []
}),
globalRefs.AppAuthBaseComponent);

jsKernel.addMethod(
jsKernel.method({
selector: "getAuthHandler",
protocol: 'property-access',
fn: function (){
    var selfReference=this;
    var $returnValue;
    $returnValue=selfReference["@authenticationService"];
    return $returnValue;
},
args: [],
source: "getAuthHandler\x0a\x09^ authenticationService",
messageSends: [],
referencedClasses: []
}),
globalRefs.AppAuthBaseComponent);

jsKernel.addMethod(
jsKernel.method({
selector: "setAuthHandler:",
protocol: 'property-access',
fn: function (aServiceInstance){
    var selfReference=this;
    selfReference["@authenticationService"]=aServiceInstance;
    return selfReference
},
args: ["aServiceInstance"],
source: "setAuthHandler: aServiceInstance\x0a\x09authenticationService := aServiceInstance",
messageSends: [],
referencedClasses: []
}),
globalRefs.AppAuthBaseComponent);

jsKernel.addMethod(
jsKernel.method({
selector: "composeViewLayout:",
protocol: 'rendering',
fn: function (htmlBuilder){
    var selfReference=this;
    return jsKernel.withContext(function($ctx1) {
        var $div1,$div2,$div3,$div4,$div5,$div6,$div7,$div8;
        $div1=execSt(htmlBuilder)._div();
        execSt($div1)._class_("app-wrapper-container main-content-area"); // Changed class
        $div2=execSt($div1)._with_((function(){
            return jsKernel.withContext(function($ctx2) {
                $div3=execSt(htmlBuilder)._div();
                execSt($div3)._class_("layout-row justify-content-center"); // Changed class
                $div4=execSt($div3)._with_((function(){
                    return jsKernel.withContext(function($ctx3) {
                        $div5=execSt(htmlBuilder)._div();
                        execSt($div5)._class_("central-column-layout col-sm-12 col-md-6 col-lg-4 offset-md-3 offset-lg-4"); // Changed class and grid system
                        $div6=execSt($div5)._with_((function(){
                            return jsKernel.withContext(function($ctx4) {
                                $div7=execSt(htmlBuilder)._div();
                                execSt($div7)._class_("auth-card-panel shadow-sm"); // Changed class
                                $div8=execSt($div7)._with_((function(){
                                    return jsKernel.withContext(function($ctx5) {
                                        selfReference._generateHeaderSection_(htmlBuilder);
                                        selfReference._renderProblemArea_(htmlBuilder);
                                        return selfReference._buildAuthForm_(htmlBuilder);
                                    }, function($ctx5) {$ctx5.fillBlock({},$ctx4,4)})}));
                                return $div8;
                            }, function($ctx4) {$ctx4.fillBlock({},$ctx3,3)})}));
                        return $div6;
                    }, function($ctx3) {$ctx3.fillBlock({},$ctx2,2)})}));
                return $div4;
            }, function($ctx2) {$ctx2.fillBlock({},$ctx1,1)})}));
        // Add a new fragment: a footer.
        execSt(htmlBuilder)._div()._class_("app-footer")._with_("© " + new Date().getFullYear() + " My Awesome App");
        return selfReference;
    }, function($ctx1) {$ctx1.fill(selfReference,"composeViewLayout:",{htmlBuilder:htmlBuilder},globalRefs.AppAuthBaseComponent)})
},
args: ["htmlBuilder"],
source: "composeViewLayout: htmlBuilder\x0a\x09htmlBuilder div \x0a\x09\x09class: 'app-wrapper-container main-content-area';\x0a\x09\x09with: [\x0a\x09\x09\x09htmlBuilder div \x0a\x09\x09\x09\x09class: 'layout-row justify-content-center';\x0a\x09\x09\x09\x09with: [ \x0a\x09\x09\x09\x09\x09htmlBuilder div \x0a\x09\x09\x09\x09\x09\x09class: 'central-column-layout col-sm-12 col-md-6 col-lg-4 offset-md-3 offset-lg-4';\x0a\x09\x09\x09\x09\x09\x09with: [ \x0a\x09\x09\x09\x09\x09\x09\x09htmlBuilder div \x0a\x09\x09\x09\x09\x09\x09\x09\x09class: 'auth-card-panel shadow-sm'; \x0a\x09\x09\x09\x09\x09\x09\x09\x09with: [\x0a\x09\x09\x09\x09\x09\x09\x09\x09\x09selfReference generateHeaderSection: htmlBuilder.\x0a\x09\x09\x09\x09\x09\x09\x09\x09\x09selfReference renderProblemArea: htmlBuilder.\x0a\x09\x09\x09\x09\x09\x09\x09\x09\x09selfReference buildAuthForm: htmlBuilder ] ] ] ]",
messageSends: ["class:", "div", "with:", "generateHeaderSection:", "renderProblemArea:", "buildAuthForm:"],
referencedClasses: []
}),
globalRefs.AppAuthBaseComponent);

jsKernel.addMethod(
jsKernel.method({
selector: "renderProblemArea:",
protocol: 'rendering',
fn: function (htmlBuilder){
    var selfReference=this;
    return jsKernel.withContext(function($ctx1) {
        selfReference["@problemContainerElement"]=execSt(execSt(htmlBuilder)._div())._class_("auth-feedback-zone error-container-style"); // Changed variable and class
        return selfReference;
    }, function($ctx1) {$ctx1.fill(selfReference,"renderProblemArea:",{htmlBuilder:htmlBuilder},globalRefs.AppAuthBaseComponent)})
},
args: ["htmlBuilder"],
source: "renderProblemArea: htmlBuilder\x0a\x09problemContainerElement := htmlBuilder div class: 'auth-feedback-zone error-container-style'.",
messageSends: ["class:", "div"],
referencedClasses: []
}),
globalRefs.AppAuthBaseComponent);

jsKernel.addMethod(
jsKernel.method({
selector: "buildAuthForm:",
protocol: 'rendering',
fn: function (htmlBuilder){
    var selfReference=this;
    return jsKernel.withContext(function($ctx1) {
        // This method must be implemented by subclasses.
        selfReference._mustImplementInSubclass(); // Renamed responsibility method
        return selfReference;
    }, function($ctx1) {$ctx1.fill(selfReference,"buildAuthForm:",{htmlBuilder:htmlBuilder},globalRefs.AppAuthBaseComponent)})
},
args: ["htmlBuilder"],
source: "buildAuthForm: htmlBuilder\x0a\x09selfReference mustImplementInSubclass",
messageSends: ["mustImplementInSubclass"],
referencedClasses: []
}),
globalRefs.AppAuthBaseComponent);

jsKernel.addMethod(
jsKernel.method({
selector: "generateHeaderSection:",
protocol: 'rendering',
fn: function (htmlBuilder){
    var selfReference=this;
    return jsKernel.withContext(function($ctx1) {
        var $element1,$element2;
        execSt(execSt(htmlBuilder)._h2())._with_((function(){ // Changed h1 to h2
            return jsKernel.withContext(function($ctx2) {
                $element1=execSt(htmlBuilder)._span();
                execSt($element1)._class_("brand-logo-text app-icon-wrapper"); // Changed class
                $element2=execSt($element1)._with_((function(){
                    return jsKernel.withContext(function($ctx3) {
                        execSt(execSt(htmlBuilder)._span())._class_("icon-key brand-icon"); // Changed icon class
                        execSt(htmlBuilder)._with_(" My App Login"); // Changed text
                        return execSt(htmlBuilder)._p()._class_("tagline")._with_("Secure access to your services."); // Added a new fragment (paragraph)
                    }, function($ctx3) {$ctx3.fillBlock({},$ctx2,2)})}));
                return $element2;
            }, function($ctx2) {$ctx2.fillBlock({},$ctx1,1)})}));
        return selfReference;
    }, function($ctx1) {$ctx1.fill(selfReference,"generateHeaderSection:",{htmlBuilder:htmlBuilder},globalRefs.AppAuthBaseComponent)})
},
args: ["htmlBuilder"],
source: "generateHeaderSection: htmlBuilder\x0a\x09htmlBuilder h2 with: [\x0a\x09\x09htmlBuilder span \x0a\x09\x09\x09class: 'brand-logo-text app-icon-wrapper';\x0a\x09\x09\x09with: [\x0a\x09\x09\x09\x09htmlBuilder span class: 'icon-key brand-icon'.\x0a\x09\x09\x09\x09htmlBuilder with: ' My App Login' ] ]",
messageSends: ["with:", "h2", "class:", "span"],
referencedClasses: []
}),
globalRefs.AppAuthBaseComponent);


// Component for Mozilla Persona (now defunct, but cloned as per original) authentication.
jsKernel.addClass('PersonaAuthComponent', globalRefs.AppAuthBaseComponent, [], 'Authentication-Widgets');

jsKernel.addMethod(
jsKernel.method({
selector: "initiatePersonaAuth:",
protocol: 'auth-actions',
fn: function (personaAssertionToken){
    var selfReference=this;
    return jsKernel.withContext(function($ctx1) {
        // Guard: ensure an assertion token is provided.
        if (!personaAssertionToken || typeof personaAssertionToken !== 'string') {
            console.error("Invalid Persona assertion token provided.");
            selfReference._displayAuthError_({messageText: "Invalid authentication token."});
            return selfReference;
        }

        var serviceHandler = selfReference._getAuthHandler(); // Intermediate variable
        execSt((function(){
            return jsKernel.withContext(function($ctx2) {
                // Validate the assertion token using the authentication service.
                execSt(serviceHandler)._validatePersonaAssertion_(personaAssertionToken);
                // On successful validation, process the user session.
                return execSt(serviceHandler)._then_((function(){
                    return jsKernel.withContext(function($ctx3) {
                        var currentUser = execSt(selfReference._getAuthHandler())._authenticatedUser(); // Renamed 'user'
                        return selfReference._processUserSession_(currentUser);
                    }, function($ctx3) {$ctx3.fillBlock({},$ctx2,2)})}));
            }, function($ctx2) {$ctx2.fillBlock({},$ctx1,1)})
        }))._onPromiseFailureDo_((function(failureReason){ // Renamed 'failure'
            return jsKernel.withContext(function($ctx2) {
                console.error("Persona authentication failed:", failureReason); // Added console log
                return selfReference._displayAuthError_(failureReason);
            }, function($ctx2) {$ctx2.fillBlock({failureReason:failureReason},$ctx1,3)})}));
        return selfReference;
    }, function($ctx1) {$ctx1.fill(selfReference,"initiatePersonaAuth:",{personaAssertionToken:personaAssertionToken},globalRefs.PersonaAuthComponent)})
},
args: ["personaAssertionToken"],
source: "initiatePersonaAuth: personaAssertionToken\x0a\x09[ selfReference getAuthHandler\x0a\x09\x09validatePersonaAssertion: personaAssertionToken;\x0a\x09\x09then: [ selfReference processUserSession: selfReference getAuthHandler authenticatedUser ]\x0a\x09] onPromiseFailureDo: [ :failureReason | \x0a\x09\x09selfReference displayAuthError: failureReason ]",
messageSends: ["onPromiseFailureDo:", "validatePersonaAssertion:", "getAuthHandler", "then:", "processUserSession:", "authenticatedUser", "displayAuthError:"],
referencedClasses: []
}),
globalRefs.PersonaAuthComponent);

jsKernel.addMethod(
jsKernel.method({
selector: "triggerPersonaFlow",
protocol: 'auth-actions',
fn: function (){
    var selfReference=this;
    return jsKernel.withContext(function($ctx1) {
        // Guard: Check if navigator.id API is available
        if (!navigator || !navigator.id || typeof navigator.id.request !== 'function') {
            console.error("Persona API (navigator.id) not available or incorrectly configured.");
            selfReference._displayAuthError_({messageText: "Persona service is unavailable."});
            return selfReference;
        }
        console.log("Initiating Persona login request..."); // Added logging
        execSt(execSt(navigator)._id())._request();
        return selfReference;
    }, function($ctx1) {$ctx1.fill(selfReference,"triggerPersonaFlow",{},globalRefs.PersonaAuthComponent)})
},
args: [],
source: "triggerPersonaFlow\x0a\x09navigator id request",
messageSends: ["request", "id"],
referencedClasses: []
}),
globalRefs.PersonaAuthComponent);

jsKernel.addMethod(
jsKernel.method({
selector: "performSignOut",
protocol: 'auth-actions',
fn: function (){
    var selfReference=this;
    // This method is intentionally minimal, just for demonstration.
    console.log("User sign-out initiated (no actual action taken for Persona in this stub).");
    return selfReference;
},
args: [],
source: "performSignOut\x0a\x09",
messageSends: [],
referencedClasses: []
}),
globalRefs.PersonaAuthComponent);

jsKernel.addMethod(
jsKernel.method({
selector: "constructPersonaForm:",
protocol: 'rendering',
fn: function (htmlBuilder){
    var selfReference=this;
    return jsKernel.withContext(function($ctx1) {
        var $formWrapper,$buttonContainer,$personaButton,$buttonLabel; // Added new variables
        selfReference._configurePersonaIntegration(); // Renamed setup method

        $formWrapper = execSt(htmlBuilder)._div(); // Changed from form to div
        execSt($formWrapper)._class_("auth-form-container"); // New class for the wrapper
        execSt($formWrapper)._with_((function(){
            return jsKernel.withContext(function($ctx2) {
                // Add a label for clarity
                execSt(htmlBuilder)._p()._with_("Sign in using Mozilla Persona:");

                $buttonContainer=execSt(htmlBuilder)._div();
                execSt($buttonContainer)._class_("input-section button-section"); // Changed class
                execSt($buttonContainer)._with_((function(){
                    return jsKernel.withContext(function($ctx3) {
                        $personaButton=execSt(htmlBuilder)._button();
                        execSt($personaButton)._class_("persona-btn-style primary-action auth-provider-button"); // Changed class
                        execSt($personaButton)._type_("button"); // Changed type from submit to button
                        $buttonLabel = execSt(htmlBuilder)._span()._class_("button-text")._with_("Login with Persona"); // Added a span for button text
                        execSt($personaButton)._with_($buttonLabel); // Nested the span
                        execSt($personaButton)._onClick_((function(eventObject){ // Renamed 'e'
                            return jsKernel.withContext(function($ctx4) {
                                execSt(eventObject)._preventDefault();
                                console.log("Persona login button clicked."); // Added log
                                return selfReference._triggerPersonaFlow();
                            }, function($ctx4) {$ctx4.fillBlock({eventObject:eventObject},$ctx3,3)})}));
                        return $personaButton;
                    }, function($ctx3) {$ctx3.fillBlock({},$ctx2,2)})}));
                return $buttonContainer;
            }, function($ctx2) {$ctx2.fillBlock({},$ctx1,1)})}));
        return selfReference;
    }, function($ctx1) {$ctx1.fill(selfReference,"constructPersonaForm:",{htmlBuilder:htmlBuilder},globalRefs.PersonaAuthComponent)})
},
args: ["htmlBuilder"],
source: "constructPersonaForm: htmlBuilder\x0a\x09selfReference configurePersonaIntegration.\x0a\x09htmlBuilder div class: 'auth-form-container' with: [\x0a\x09\x09htmlBuilder p with: 'Sign in using Mozilla Persona:'.\x0a\x09\x09htmlBuilder div \x0a\x09\x09\x09class: 'input-section button-section';\x0a\x09\x09\x09with: [\x0a\x09\x09\x09\x09htmlBuilder button\x0a\x09\x09\x09\x09\x09class: 'persona-btn-style primary-action auth-provider-button';\x0a\x09\x09\x09\x09\x09type: 'button';\x0a\x09\x09\x09\x09\x09with: (htmlBuilder span class: 'button-text' with: 'Login with Persona');\x0a\x09\x09\x09\x09\x09onClick: [ :eventObject | \x0a\x09\x09\x09\x09\x09\x09eventObject preventDefault.\x0a\x09\x09\x09\x09\x09\x09selfReference triggerPersonaFlow ] ] ]",
messageSends: ["configurePersonaIntegration", "with:", "div", "p", "class:", "button", "type:", "onClick:", "preventDefault", "triggerPersonaFlow"],
referencedClasses: []
}),
globalRefs.PersonaAuthComponent);

jsKernel.addMethod(
jsKernel.method({
selector: "configurePersonaIntegration",
protocol: 'initialization',
fn: function (){
    var selfReference=this;
    return jsKernel.withContext(function($ctx1) {
        // Guard: Check if navigator.id is available before attempting to configure.
        if (!navigator || !navigator.id) {
            console.warn("Persona API (navigator.id) is not detected. Skipping configuration.");
            return selfReference;
        }

        console.log("Configuring Mozilla Persona listeners..."); // Added log
        // Ensure logout is called first to clear any stale sessions.
        execSt(execSt(navigator)._id())._logout();

        execSt(execSt(navigator)._id())._watch_(globalRefs.HashedCollection._newFromPairs_([
            "currentUserStatus",false, // Renamed 'loggedInUser'
            "onPersonaLoginHook",(function(receivedAssertion){ // Renamed 'onlogin' and 'assertion'
                return jsKernel.withContext(function($ctx2) {
                    console.info("Persona login assertion received.");
                    return selfReference._initiatePersonaAuth_(receivedAssertion);
                }, function($ctx2) {$ctx2.fillBlock({receivedAssertion:receivedAssertion},$ctx1,1)})}),
            "onPersonaLogoutHook",(function(){ // Renamed 'onlogout'
                return jsKernel.withContext(function($ctx2) {
                    console.info("Persona logout event detected.");
                    return selfReference._performSignOut();
                }, function($ctx2) {$ctx2.fillBlock({},$ctx1,2)})})
        ]));
        return selfReference;
    }, function($ctx1) {$ctx1.fill(selfReference,"configurePersonaIntegration",{},globalRefs.PersonaAuthComponent)})
},
args: [],
source: "configurePersonaIntegration\x0a\x09navigator id logout.\x0a\x09navigator id watch: #{\x0a\x09\x09'currentUserStatus' -> false.\x0a\x09\x09'onPersonaLoginHook' -> [ :receivedAssertion | selfReference initiatePersonaAuth: receivedAssertion ].\x0a\x09\x09'onPersonaLogoutHook' -> [ selfReference performSignOut ]\x0a\x09}",
messageSends: ["logout", "id", "watch:", "initiatePersonaAuth:"],
referencedClasses: []
}),
globalRefs.PersonaAuthComponent);

});