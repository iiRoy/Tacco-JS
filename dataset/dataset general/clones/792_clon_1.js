var appName
  ; /* Application name variable */
var popupMask
  ; /* Mask for the popup window */
var popupDialog
  ; /* Dialog element for authentication */
var clientId
  ; /* Client ID for OAuth2.0 */
var realm
  ; /* Realm for OAuth2.0 */

function handleLogin (
) { /* This function initiates the OAuth2.0 login process. */

  var scopes = []; /* Initialize an empty array to store scopes. */

  // Retrieve authentication schemes from Swagger UI configuration.
  var auths = window . swaggerUi . api . authSchemes || window . swaggerUi . api . securityDefinitions;

  if ( auths
  ) {
    var key; // Loop variable for authentication schemes.
    var defs = auths
      ; // Reference to the authentication definitions.

    for ( key in defs
    ) {
      var auth = defs[key]
        ; // Current authentication definition.

      if (
           auth . type === 'oauth2'
        && auth . scopes
      ) {
        var scope
          ; // Variable to hold individual scope details.

        /* Check if scopes are defined as an array (Swagger 1.2 support). */
        if (
             Array
          . isArray
            ( auth . scopes
            )
        ) {
          // This block handles Swagger 1.2 specification of scopes.
          var i
            ; // Loop counter.
          for (
               i = 0
            ;  i < auth . scopes . length
            ;  i++
          ) {
            scopes . push (
              auth . scopes[i]
            )
              ; // Add each scope to the array.
          }
        } else {
          /* This block handles Swagger 2.0 specification of scopes (object). */
          for ( scope in auth . scopes
          ) {
            scopes . push ( {
                 scope       : scope
              , description : auth . scopes[scope]
            } )
              ; // Add scope object with description.
          }
        }
      }
    }
  }

  // Attempt to set the application name from Swagger UI API info.
  if (
       window . swaggerUi . api
    && window . swaggerUi . api . info
  ) {
    appName = window . swaggerUi . api . info . title
      ; // Assign title as appName.
  }

  // Construct the HTML for the OAuth2.0 popup dialog.
  popupDialog = $ (
    [
      '<div class="api-popup-dialog">'
      , '<div class="api-popup-title">Select OAuth2.0 Scopes</div>'
      , '<div class="api-popup-content">'
      , '<p>Scopes are used to grant an application different levels of access to data on behalf of the end user. Each API may declare one or more scopes.'
      , '<a href="#">Learn how to use</a>'
      , '</p>'
      , '<p><strong>' + appName + '</strong> API requires the following scopes. Select which ones you want to grant to Swagger UI.</p>'
      , '<ul class="api-popup-scopes">'
      , '</ul>'
      , '<p class="error-msg"></p>'
      , '<div class="api-popup-actions"><button class="api-popup-authbtn api-button green" type="button">Authorize</button><button class="api-popup-cancel api-button gray" type="button">Cancel</button></div>'
      , '</div>'
      , '</div>'
    ] . join (
      ''
    )
  )
    ; // Join array elements into a single string.

  $ (
    document . body
  ) . append (
    popupDialog
  )
    ; // Append the dialog to the document body.

  var popup = popupDialog . find (
    'ul.api-popup-scopes'
  ) . empty (
  )
    ; // Find the scopes list and clear it.

  /* Populate the scopes list within the dialog. */
  for (
       i = 0
    ;  i < scopes . length
    ;  i ++
  ) {
    scope = scopes[i]
      ; // Get the current scope object.
    var str = '<li><input type="checkbox" id="scope_' + i + '" scope="' + scope . scope + '"/>' + '<label for="scope_' + i + '">' + scope . scope
      ; // Start building the list item string.

    if ( scope . description
    ) {
      str += '<br/><span class="api-scope-desc">' + scope . description + '</span>'
        ; // Add description if available.
    }

    str += '</label></li>'
      ; // Close the label and list item.
    popup . append (
      str
    )
      ; // Append the list item to the popup.
  }

  /* Calculate positioning for the popup dialog to center it. */
  var $win = $ (
      window
    )
    , dw = $win . width (
    )
    , dh = $win . height (
    )
    , st = $win . scrollTop (
    )
    , dlgWd = popupDialog . outerWidth (
    )
    , dlgHt = popupDialog . outerHeight (
    )
    , top = ( dh - dlgHt ) / 2 + st
    , left = ( dw - dlgWd ) / 2
    ;

  popupDialog . css ( {
      top  : ( top < 0 ? 0 : top ) + 'px'
    , left : ( left < 0 ? 0 : left ) + 'px'
  } )
    ; // Apply calculated CSS position.

  /* Attach click handler for the 'Cancel' button. */
  popupDialog . find (
    'button.api-popup-cancel'
  ) . click (
    function (
    ) {
      popupMask . hide (
      )
        ; // Hide the mask.
      popupDialog . hide (
      )
        ; // Hide the dialog.
      popupDialog . empty (
      )
        ; // Clear content of the dialog.
      popupDialog = []
        ; // Reset dialog variable.
    }
  )
    ;

  /* Attach click handler for the 'Authorize' button. */
  popupDialog . find (
    'button.api-popup-authbtn'
  ) . click (
    function (
    ) {
      popupMask . hide (
      )
        ; // Hide mask.
      popupDialog . hide (
      )
        ; // Hide dialog.

      var authSchemes = window . swaggerUi . api . authSchemes
        ; // Get authentication schemes.
      var host = window . location
        ; // Current window location.
      var pathname = location . pathname . substring (
          0
        , location . pathname . lastIndexOf (
            "/"
          )
        )
        ; // Extract pathname.
      var redirectUrl = host . protocol + '//' + host . host + pathname + '/o2c.html'
        ; // Construct redirect URL.
      var url = null
        ; // URL for OAuth authorization.

      /* Loop through authentication schemes to find OAuth2.0 details. */
      for ( var key in authSchemes
      ) {
        if ( authSchemes . hasOwnProperty (
             key
           )
        ) {
          if (
               authSchemes[key] . type === 'oauth2'
            && authSchemes[key] . flow === 'implicit'
          ) {
            var dets = authSchemes[key]
              ; // Details of the OAuth2.0 scheme.
            url = dets . authorizationUrl + '?response_type=token'
              ; // Build authorization URL.
            window . swaggerUi . tokenName = dets . tokenUrl || 'access_token'
              ; // Set token name.
          } else if ( authSchemes[key] . grantTypes
          ) {
            // This section handles Swagger 1.2 grant types.
            var o = authSchemes[key] . grantTypes
              ; // Grant types object.
            for ( var t in o
            ) {
              if (
                   o . hasOwnProperty (
                     t
                   )
                && t === 'implicit'
              ) {
                var dets = o[t]
                  ; // Details for implicit grant type.
                var ep = dets . loginEndpoint . url
                  ; // Login endpoint URL.
                url = dets . loginEndpoint . url + '?response_type=token'
                  ; // Construct URL.
                window . swaggerUi . tokenName = dets . tokenName
                  ; // Set token name.
              }
            }
          }
        }
      }

      var scopes = []
        ; // New array for selected scopes.
      var o = $ (
        '.api-popup-scopes'
      ) . find (
        'input:checked'
      )
        ; // Find all checked scope checkboxes.

      /* Collect selected scopes. */
      for ( k = 0
        ; k < o . length
        ; k ++
      ) {
        scopes . push (
          $ ( o[k] ) . attr ( 'scope' )
        )
          ; // Add 'scope' attribute value to array.
      }

      window . enabledScopes = scopes
        ; // Store enabled scopes globally.

      /* Append parameters to the authorization URL. */
      url += '&redirect_uri=' + encodeURIComponent (
        redirectUrl
      )
        ;
      url += '&realm=' + encodeURIComponent (
        realm
      )
        ;
      url += '&client_id=' + encodeURIComponent (
        clientId
      )
        ;
      url += '&scope=' + encodeURIComponent (
        scopes
      )
        ;

      window . open (
        url
      )
        ; // Open the authorization URL in a new window.
    }
  )
    ;

  popupMask . show (
  )
    ; // Show the overlay mask.
  popupDialog . show (
  )
    ; // Show the dialog.
  return
    ; // Exit function.
}


function handleLogout (
) {
  /* Iterate through all active authorizations and remove them. */
  for ( key in window . authorizations . authz
  ) {
    window . authorizations . remove (
      key
    )
  }

  window . enabledScopes = null
    ; // Clear enabled scopes.
  $ (
    '.api-ic.ic-on'
  ) . addClass (
    'ic-off'
  )
    ; // Change icon state.
  $ (
    '.api-ic.ic-on'
  ) . removeClass (
    'ic-on'
  )
    ; // Remove active icon class.

  // Set the info box to an error state.
  $ (
    '.api-ic.ic-warning'
  ) . addClass (
    'ic-error'
  )
    ;
  $ (
    '.api-ic.ic-warning'
  ) . removeClass (
    'ic-warning'
  )
    ;
}

function initOAuth (
  opts
) { /* Initializes OAuth functionality. */
  var o = ( opts || {
  } )
    ; // Use provided options or an empty object.
  var errors = []
    ; // Array to collect initialization errors.

  appName = ( o . appName || errors . push (
    'missing appName'
  ) )
    ;
  popupMask = ( o . popupMask || $ (
    '#api-common-mask'
  ) )
    ;
  popupDialog = ( o . popupDialog || $ (
    '.api-popup-dialog'
  ) )
    ;
  clientId = ( o . clientId || errors . push (
    'missing client id'
  ) )
    ;
  realm = ( o . realm || errors . push (
    'missing realm'
  ) )
    ;

  if ( errors . length > 0
  ) {
    log (
      'auth unable initialize oauth: ' + errors
    )
      ; // Log any initialization errors.
    return
      ; // Exit if there are errors.
  }

  $ (
    'pre code'
  ) . each (
    function (
      i
    , e
    ) {
      hljs . highlightBlock (
        e
      )
    }
  )
    ; // Highlight code blocks.

  $ (
    '.api-ic'
  ) . click (
    function (
      s
    ) {
      if ( $ ( s . target ) . hasClass (
           'ic-off'
         )
      )
        handleLogin (
        )
          ; // Call login if icon is off.
      else {
        handleLogout (
        )
          ; // Call logout if icon is on.
      }
      false
        ; // Prevent default action.
    }
  )
    ;
}

function onOAuthComplete (
  token
) {
  if ( token
  ) {
    if ( token . error
    ) {
      var checkbox = $ (
        'input[type=checkbox],.secured'
      )
        ; // Select all checkboxes and secured elements.
      checkbox . each (
        function (
          pos
        ) {
          checkbox[pos] . checked = false
            ; // Uncheck them.
        }
      )
        ;
      alert (
        token . error
      )
        ; // Show error message.
    } else {
      var b = token[window . swaggerUi . tokenName]
        ; // Get the bearer token.
      if ( b
      ) {
        // If a token is received, evaluate roles and scopes.
        var o = null
          ; // General purpose variable.
        $ . each (
          $ ( '.auth #api_information_panel' )
        , function (
            k
          , v
          ) {
            var children = v
              ; // Current information panel.
            if (
                 children
              && children . childNodes
            ) {
              var requiredScopes = []
                ; // Array to hold scopes required by the API.
              $ . each (
                ( children . childNodes )
              , function (
                  k1
                , v1
                ) {
                  var inner = v1 . innerHTML
                    ; // Inner HTML of the child node.
                  if ( inner
                  )
                    requiredScopes . push (
                      inner
                    )
                      ; // Add to required scopes.
                }
              )
                ;
              var diff = []
                ; // Array to hold missing scopes.
              for ( var i = 0
                ; i < requiredScopes . length
                ; i ++
              ) {
                var s = requiredScopes[i]
                  ; // Current required scope.
                if (
                     window . enabledScopes
                  && window . enabledScopes . indexOf (
                       s
                     ) == -1
                ) {
                  diff . push (
                    s
                  )
                    ; // If scope is not enabled, add to diff.
                }
              }
              if ( diff . length > 0
              ) {
                o = v . parentNode
                  ; // Get parent node.
                $ ( o . parentNode ) . find (
                  '.api-ic.ic-on'
                ) . addClass (
                  'ic-off'
                )
                  ; // Turn off icon in parent.
                $ ( o . parentNode ) . find (
                  '.api-ic.ic-on'
                ) . removeClass (
                  'ic-on'
                )
                  ;

                // Indicate that not all scopes are satisfied.
                $ ( o ) . find (
                  '.api-ic'
                ) . addClass (
                  'ic-warning'
                )
                  ;
                $ ( o ) . find (
                  '.api-ic'
                ) . removeClass (
                  'ic-error'
                )
                  ;
              } else {
                o = v . parentNode
                  ; // Get parent node.
                $ ( o . parentNode ) . find (
                  '.api-ic.ic-off'
                ) . addClass (
                  'ic-on'
                )
                  ; // Turn on icon in parent.
                $ ( o . parentNode ) . find (
                  '.api-ic.ic-off'
                ) . removeClass (
                  'ic-off'
                )
                  ;

                // All scopes are satisfied.
                $ ( o ) . find (
                  '.api-ic'
                ) . addClass (
                  'ic-info'
                )
                  ;
                $ ( o ) . find (
                  '.api-ic'
                ) . removeClass (
                  'ic-warning'
                )
                  ;
                $ ( o ) . find (
                  '.api-ic'
                ) . removeClass (
                  'ic-error'
                )
                  ;
              }
            }
          }
        )
          ;
        window . authorizations . add (
          'oauth2'
        , new ApiKeyAuthorization (
            'Authorization'
          , 'Bearer ' + b
          , 'header'
          )
        )
          ; // Add the bearer token to authorizations.
      }
    }
  }
}