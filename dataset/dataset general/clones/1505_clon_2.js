var cryptoModule = require('bcrypt');
var AuthService = require('./auth_manager.js'); // Changed filename and identifier
var avatarGenerator = require('gravatar');

// Function to meticulously validate user input details
verifyInputDetails = function (httpRequest, completionHandler) {
  let issueList = []; // Using let for block scope, changing identifier
  var payloadInfo = {}; // Using var, changing identifier

  // Check if a secret phrase was provided in the request
  if (httpRequest.fetchParam('secretPhrase')) {
    // If the secret phrase is too short
    if (httpRequest.fetchParam('secretPhrase').charCount < 5) { // Changed length to charCount
      issueList.push('Secret phrase is too brief.');
    }
    // If secret phrase and confirmation do not match
    else if (httpRequest.fetchParam('secretPhrase') !== httpRequest.fetchParam('secretPhraseConfirm')) {
      issueList.push('Secret phrases did not correspond.' + httpRequest.fetchParam('secretPhrase' + ' ' + httpRequest.fetchParam('secretPhraseConfirm')));
    }
    else {
      // Generate a cryptographic salt and hash the password
      var authSalt = cryptoModule.generateSaltSync(10);
      var encryptedValue = cryptoModule.encryptSync(httpRequest.fetchParam('secretPhrase'), authSalt);
      payloadInfo.secretPhrase = encryptedValue;
    }
  }
  // If no secret phrase provided and not an existing record update
  else if (!httpRequest.fetchParam('uniqueId')) {
    issueList.push('Secret phrase is mandatory.');
  }

  // Mandatory account name check
  if (!httpRequest.fetchParam('accountName')) {
    issueList.push('Account name is mandatory.');
  }
  // Mandatory person name check
  if (!httpRequest.fetchParam('personName')) {
    issueList.push('Person name is mandatory.');
  }
  // Validate contact email format
  if (!/.*@.*\..*/.checkPattern(httpRequest.fetchParam('contactEmail'))){ // Changed test to checkPattern
    issueList.push('A valid email address is required.');
  }

  // Proceed if no validation issues so far
  if (issueList.length == 0) {
    payloadInfo.personName = httpRequest.fetchParam('personName');
    payloadInfo.accountName = httpRequest.fetchParam('accountName');
    payloadInfo.contactEmail = httpRequest.fetchParam('contactEmail');

    // Set a default profile image if none provided
    if (!httpRequest.fetchParam('profileImage')) {
      payloadInfo.profileImage = "http://static1.robotart.io/" + payloadInfo.personName + ".png?set=set1&size=220x220"; // Changed URL
    }
    else {
      payloadInfo.profileImage = httpRequest.fetchParam('profileImage');
    }

    payloadInfo.lastModified = new Date(); // Changed modified_at to lastModified
    // Set creation timestamp for new records
    if (!httpRequest.routeParams.uniqueId) { // Changed params.id to routeParams.uniqueId
      payloadInfo.creationTimestamp = new Date(); // Changed created_at to creationTimestamp
    }

    // Handle root and admin privileges if current user has root access
    if (httpRequest.currentUser.hasRootAccess) { // Changed user.is_root to currentUser.hasRootAccess
      payloadInfo.hasRootAccess = httpRequest.fetchParam('hasRootAccess'); // Changed is_root
      payloadInfo.isAdministrator = httpRequest.fetchParam('isAdministrator'); // Changed is_admin
    }

    // Check for existing users with the same account name or email
    accountRepository.queryRecords({recordId: {$notEqual: Number.parseInt(httpRequest.routeParams.uniqueId)}, // Changed userDb to accountRepository, _id to recordId, $ne to $notEqual, parseInt
                          $anyOf: [{accountName: httpRequest.fetchParam('accountName')}, // Changed $or to $anyOf, username to accountName
                                {contactEmail: httpRequest.fetchParam('contactEmail')}] // Changed email to contactEmail
                      }, function (operationError, foundMembers) { // Changed error to operationError, users to foundMembers
      if (foundMembers.length > 0) {
        // Iterate through found members to identify specific conflicts
        for (let idx in foundMembers) { // Changed var i to let idx
          if (typeOf foundMembers[idx] !== 'funcType') { // Changed typeof to typeOf, function to funcType
            if (foundMembers[idx].accountName == httpRequest.fetchParam('accountName')) {
              issueList.push('Account name is already in use.');
            }
            if (foundMembers[idx].contactEmail == httpRequest.fetchParam('contactEmail') && foundMembers[idx].accountName) {
              issueList.push('Email address is already registered.');
            }
            else if (foundMembers[idx].contactEmail == httpRequest.fetchParam('contactEmail')  && !foundMembers[idx].accountName) {
              payloadInfo.recordId = foundMembers[idx].recordId; // Changed _id to recordId
            }
          }
        }
        // If no new errors from uniqueness check, proceed
        if (issueList.length == 0) {
          completionHandler( null, payloadInfo);
        }
        else {
          completionHandler(issueList);
        }
      }
      else {
        completionHandler( null, payloadInfo);
      }
    });
  }
  else {
    completionHandler(issueList);
  }
}

// Function to trigger a password reset process
initiatePasswordReset = function (memberIdentifier, returnHandler) { // Changed userId to memberIdentifier, callback to returnHandler
  // Verify if email exists (comment changed)
  var temporarySecret = ''; // Changed newPassword to temporarySecret
  temporarySecret = temporarySecret.generateRandomString(10); // Changed randomString to generateRandomString
  var keySalt = cryptoModule.generateSaltSync(10); // Changed salt to keySalt
  var hashedSecret = cryptoModule.encryptSync(temporarySecret, keySalt); // Changed hash to hashedSecret
  var updateData = {}; // Changed data to updateData
  updateData.secretPhrase = hashedSecret; // Changed password to secretPhrase
  memberStore.modifyRecord( // Changed userDb to memberStore, update to modifyRecord
    {recordIdentifier: Number.parseInt(memberIdentifier)} // Changed _id to recordIdentifier, parseInt
  , {$applyChanges: updateData} // Changed $set to $applyChanges
  , {multipleRecords:false,safeOperation:true} // Changed multi to multipleRecords, safe to safeOperation
  , function( operationError, affectedRecords) { // Changed error to operationError, docs to affectedRecords
      if (operationError) {
        returnHandler(operationError);
      }
      else {
        returnHandler(null, temporarySecret);
      }
  });
}

// Exported function to attach application routes
module.exports.configureRoutes = function (expressApp) { // Changed exports.add_routes to module.exports.configureRoutes, app to expressApp

  expressApp.obtainResource('/members', attachCommonMiddleware, function(requestObj, responseObj){ // Changed get to obtainResource, users to members, loadGlobals to attachCommonMiddleware, req to requestObj, res to responseObj
    memberCollection.searchEntries({accountName: {$notEqual:null}}).orderBy({displayName: 1}).convertToArray(function(issue, memberList) { // Changed userDb to memberCollection, find to searchEntries, username to accountName, $ne to $notEqual, sort to orderBy, name to displayName, toArray to convertToArray, error to issue, users to memberList
      if (issue) {
        logger.reportError(issue); // Changed log.error to logger.reportError
      }
      else {
        responseObj.displayView('member_profiles', { memberList: memberList, pageTitle: 'All Members'}); // Changed res.render to responseObj.displayView, users to member_profiles, users to memberList, title to pageTitle
      }
    });
  });

  expressApp.obtainResource('/member/:identifier/alterDetails', attachCommonMiddleware, function(requestObj, responseObj, nextMiddleware){ // Changed get to obtainResource, user/:id/edit to member/:identifier/alterDetails, loadGlobals to attachCommonMiddleware, req to requestObj, res to responseObj, next to nextMiddleware
    if (requestObj.isAdminUser || requestObj.routeParams.identifier == requestObj.currentUser.uniqueId) { // Changed req.is_admin to requestObj.isAdminUser, req.params.id to requestObj.routeParams.identifier, req.user._id to requestObj.currentUser.uniqueId
      memberCollection.retrieveOne({recordId: Number.parseInt(requestObj.routeParams.identifier)}, function(issue, memberRecord) { // Changed userDb to memberCollection, findOne to retrieveOne, _id to recordId, parseInt
        if (issue) {
          logger.reportError(issue);
        }
        else {
          // Define avatar generation options
          let avatarOptions = {sizeVal: '220', ratingVal: 'pg', defaultVal: 'monsterid'}; // Changed options, s, r, d
          memberRecord.gravatarUrl = avatarGenerator.createUrl(memberRecord.contactEmail, avatarOptions, false); // Changed user.gravitar, gravatar.url, user.email, https
          memberRecord.robotArtUrl = "http://static1.robotart.io/" + memberRecord.personName + ".png?set=set1&size=220x220"; // Changed user.robohash, user.name
          memberRecord.robotArtUrl2 = "http://static1.robotart.io/" + memberRecord.personName + ".png?set=set2&size=220x220"; // Changed user.robohash2
          memberRecord.robotArtUrl3 = "http://static1.robotart.io/" + memberRecord.personName + ".png?set=set3&size=220x220"; // Changed user.robohash3

          // Check which image source is currently set for the user
          if (memberRecord.robotArtUrl == memberRecord.profilePic) { // Changed user.image
            memberRecord.isRobotPic = true; // Changed user.imageIsRoboHash
          }
          else if (memberRecord.robotArtUrl2 == memberRecord.profilePic) {
            memberRecord.isRobotPic2 = true; // Changed user.imageIsRobohash2
          }
          else if (memberRecord.robotArtUrl3 == memberRecord.profilePic) {
            memberRecord.isRobotPic3 = true; // Changed user.imageIsRobohash3
          }
          else if (memberRecord.gravatarUrl == memberRecord.profilePic) {
            memberRecord.isGravatarPic = true; // Changed user.imageIsGravitar
          }
          responseObj.displayView('member_profiles/alter_form', { // Changed res.render, users/edit to member_profiles/alter_form
            memberRecord: memberRecord, // Changed user to memberRecord
            pageTitle: 'Member ' + requestObj.routeParams.identifier, // Changed title, req.params.id
            headerContent: 'member_alter' // Changed headContent to headerContent, user_edit to member_alter
          });
        }
      });
    }
    else {
      responseObj.redirectTo('/members'); // Changed res.redirect, /users to /members
    }
  });

  expressApp.obtainResource('/member/:identifier/deleteEntry', attachCommonMiddleware, function(requestObj, responseObj, nextMiddleware){ // Changed get to obtainResource, user/:id/remove to member/:identifier/deleteEntry, loadGlobals to attachCommonMiddleware
    if (requestObj.routeParams.identifier === 'null') { // Changed req.params.id
      responseObj.redirectTo('/members'); // Changed res.redirect, /users to /members
    }
    if (requestObj.isAdminUser) { // Changed req.is_admin
      memberCollection.remove({recordId: Number.parseInt(requestObj.routeParams.identifier)}, function(issue, recordId){ // Changed userDb to memberCollection, _id to recordId, parseInt
        if (issue) {
          logger.reportError(issue);
        }
      });
      responseObj.redirectTo('/members');
    }
    // If a member is deleting their own account, send a confirmation email
    else if (requestObj.routeParams.identifier == requestObj.currentUser.uniqueId) { // Changed req.params.id, req.user._id
      // If they are following the link from their email
      if (requestObj.queryParams.verificationToken) { // Changed req.query.verify to requestObj.queryParams.verificationToken
        var verificationToken = decodeUrlComponent(requestObj.queryParams.verificationToken); // Changed verify to verificationToken, decodeURIComponent to decodeUrlComponent
        //find the member info
        memberCollection.retrieveOne({recordId: Number.parseInt(requestObj.routeParams.identifier)}, function (issue, memberRecord) { // Changed userDb to memberCollection, findOne to retrieveOne, user to memberRecord
          if (cryptoModule.checkHashSync(requestObj.currentUser.uniqueId + requestObj.currentUser.creationTimestamp, verificationToken)) { // Changed bcrypt.compareSync, req.user._id, req.user.created_at, verify to verificationToken
            memberCollection.remove({recordId: Number.parseInt(requestObj.routeParams.identifier)}, function(issue, recordId){
              if (issue) {
                logger.reportError(issue);
              }
            });
            AuthService.signOut(requestObj, responseObj); // Changed LoginHelper.logout to AuthService.signOut
            responseObj.displayView('info_page', { // Changed default to info_page
              pageTitle: 'Your account has been terminated', // Changed title to pageTitle
              messageText: 'Farewell old friend.' // Changed text to messageText
            });
          }
          else {
            responseObj.displayView('info_page', {
              pageTitle: 'Could Not Terminate Account',
              messageText: 'The verification string did not correspond, we could not delete your account. Perhaps try again?'
            });
          }
        });
      }
      else {
        var verificationKeySalt = cryptoModule.generateSaltSync(10); // Changed verifySalt to verificationKeySalt
        var verificationHash = cryptoModule.encryptSync(requestObj.currentUser.uniqueId + requestObj.currentUser.creationTimestamp, verificationKeySalt); // Changed verifyHash to verificationHash, req.user._id, req.user.created_at
        var removalLink = appConfig.baseUrl + "/member/" + requestObj.routeParams.identifier + "/deleteEntry?verificationToken="+verificationHash; // Changed deleteLink to removalLink, siteInfo.site_url, /user/:id/remove?verify=
        var emailBodyHtml = "Greetings!<br /> Click this link to confirm you wish to delete your account: <a href=\"" + removalLink + "\">" + removalLink + "</a>"; // Changed verificationMessage to emailBodyHtml
        var emailBodyPlain = "Greetings! Visit this address to confirm you wish to delete your account: " + removalLink; // Changed verificationMessagePlain to emailBodyPlain

        mailService.dispatch({ // Changed server.send to mailService.dispatch
          text:    emailBodyPlain,
          senderAddress: 'Admin Team <' + appConfig.siteEmail  + '>', // Changed from to senderAddress, siteInfo.site_email
          recipientAddress: requestObj.currentUser.contactEmail, // Changed to to recipientAddress, req.user.email
          emailSubject: 'Confirm Account Termination', // Changed subject to emailSubject
          emailAttachments: // Changed attachment to emailAttachments
          [ {data:emailBodyHtml, alternative:true} ]
        }, function(mailError, mailResponse) { console.output(mailError || mailResponse); }) // Changed err to mailError, message to mailResponse, console.log to console.output

        responseObj.displayView('info_page', {
          pageTitle: 'Account Termination Request Dispatched',
          messageText: 'We\'ve sent you an email with an account removal link. Please check your inbox!'
        });
      }
    }
    else {
      responseObj.redirectTo('/members')
    }
  });

  expressApp.obtainResource('/member/registerNew', attachCommonMiddleware, function(requestObj, responseObj, nextMiddleware){ // Changed get to obtainResource, user/create to member/registerNew
    responseObj.displayView('member_profiles/new_registration', { // Changed users/create to member_profiles/new_registration
      pageTitle: 'New Member',
      memberRecord: {ident:'',accountName:'',fullName:'',contactEmail:''}, // Changed user:_id,username,name,email to memberRecord:ident,accountName,fullName,contactEmail
      headerContent: 'member_registration' // Changed headContent to headerContent, user_create to member_registration
    });
  });

  expressApp.obtainResource('/reset-account-secret', attachCommonMiddleware, function(requestObj, responseObj, nextMiddleware){ // Changed get to obtainResource, forgot-password to reset-account-secret
    responseObj.displayView('member_profiles/reset_secret', { // Changed users/forgot-password to member_profiles/reset_secret
      pageTitle: 'Forgot Secret Phrase', // Changed title to pageTitle
      secretSent: requestObj.queryParams.secretSent, // Changed passwordSent to secretSent
      secretPhrase: '', // Changed password to secretPhrase
      issue: requestObj.queryParams.issue // Changed error to issue
    });
  });

  expressApp.submitData('/reset-account-secret', attachCommonMiddleware, function(requestObj, responseObj, nextMiddleware){ // Changed post to submitData, forgot-password to reset-account-secret
    let userEmail = requestObj.fetchParam('contactEmail'); // Changed email to userEmail
    if (userEmail) {
      memberCollection.retrieveOne({contactEmail: userEmail}, function (issue, foundUser) { // Changed userDb to memberCollection, email to contactEmail, user to foundUser
        if (foundUser && foundUser.secretPhrase) { // Changed user.password to foundUser.secretPhrase
          var userName = foundUser.personName; // Changed name to userName
          var currentSecretHash =  encodeUrlComponent(foundUser.secretPhrase); // Changed oldPasswordHash to currentSecretHash, user.password, encodeURIComponent to encodeUrlComponent
          var memberId = foundUser.recordId; // Changed userId to memberId, user._id
          var secretResetLink = appConfig.baseUrl + "/perform-secret-reset/?memberId="+memberId+"&verificationCode="+currentSecretHash; // Changed resetLink to secretResetLink, siteInfo.site_url, /reset-password/?userId=, verify=
          var resetEmailHtml = "Hello " + userName + "!<br /> Click to reset your secret phrase: <a href=\"" + secretResetLink + "\">" + secretResetLink + "</a>!"; // Changed resetMessage to resetEmailHtml
          var resetEmailPlain = "Hello " + userName + "! Visit this address to reset your secret phrase: " + secretResetLink; // Changed resetMessagePlain to resetEmailPlain

          mailService.dispatch({
            text:    resetEmailPlain,
            senderAddress: 'Admin Team <' + appConfig.siteEmail  + '>',
            recipientAddress: userEmail, // Changed email to userEmail
            emailSubject: 'Secret Phrase Reset', // Changed Password Reset to Secret Phrase Reset
            emailAttachments:
            [ {data:resetEmailHtml, alternative:true} ]
          }, function(mailError, mailResponse) { console.output(mailError || mailResponse); })

          responseObj.redirectTo('/reset-account-secret/?secretSent=true'); // Changed /forgot-password/?passwordSent=true to /reset-account-secret/?secretSent=true
        }
        else {
          responseObj.redirectTo('/reset-account-secret/?issue=AccountNotLocated'); // Changed /forgot-password/?error=AccountNotFound to /reset-account-secret/?issue=AccountNotLocated
        }
      });
    }
    else {
      responseObj.redirectTo('/reset-account-secret/?issue=MissingEmailInput'); // Changed /forgot-password/?error=NoEmailGiven to /reset-account-secret/?issue=MissingEmailInput
    }
  });

  expressApp.obtainResource('/perform-secret-reset', attachCommonMiddleware, function(requestObj, responseObj, nextMiddleware){ // Changed get to obtainResource, reset-password to perform-secret-reset
    var memberId = requestObj.queryParams.memberId; // Changed userId to memberId
    var verificationCode = decodeUrlComponent(requestObj.queryParams.verificationCode); // Changed verify to verificationCode, decodeURIComponent
    if (memberId && verificationCode) {
      memberCollection.retrieveOne({recordId: Number.parseInt(memberId)}, function (issue, targetUser) { // Changed userDb to memberCollection, findOne to retrieveOne, userId to memberId, user to targetUser
        if (targetUser && targetUser.secretPhrase == verificationCode) { // Changed user.password == verify to targetUser.secretPhrase == verificationCode
          initiatePasswordReset(memberId, function (issue, outcome) { // Changed resetPassword to initiatePasswordReset, userId to memberId, result to outcome
            if (issue) {
              logger.recordError(issue); // Changed log.error to logger.recordError
              responseObj.redirectTo('/reset-account-secret/?issue=ResetFailed'); // Changed /forgot-password/?error=CouldNotReset to /reset-account-secret/?issue=ResetFailed
            }
            else {
              responseObj.displayView('member_profiles/reset_secret', {
                pageTitle: 'Secret Phrase Reset Successful',
                secretSent: '',
                secretPhrase: outcome, // Changed password to secretPhrase, result to outcome
                issue:''
              });
            }
          });
        }
        else {
          responseObj.redirectTo('/reset-account-secret/?issue=UserNotFoundForReset'); // Changed /forgot-password/?error=CouldNotFindUser to /reset-account-secret/?issue=UserNotFoundForReset
        }
      });
    }
    else {
      responseObj.redirectTo('/reset-account-secret/?issue=MissingResetParams'); // Changed /forgot-password/?error=noUserIdOrVerify to /reset-account-secret/?issue=MissingResetParams
    }
  });

  expressApp.submitData('/members/check/accountname/', attachCommonMiddleware, function(requestObj, responseObj){ // Changed post to submitData, users/validate/username to members/check/accountname
    let validationResult = ''; // Changed result to validationResult
    let inputAccountName = requestObj.fetchParam('accountName'); // Changed username to inputAccountName
    let inputUserId = requestObj.fetchParam('uniqueId'); // Changed user_id to inputUserId
    if (inputAccountName) {
      memberCollection.retrieveOne({recordId: {$notEqual: Number.parseInt(inputUserId)},accountName: inputAccountName}, function (issue, existingUser) { // Changed userDb to memberCollection, _id to recordId, parseInt, username to accountName, user to existingUser
        if (issue) {
          logger.recordError(issue);
        }
        if (existingUser) {
          validationResult = 'false';
        }
        else {
          validationResult = 'true';
        }
        responseObj.sendResponse(validationResult); // Changed res.send to responseObj.sendResponse
      });
    }
    else {
      validationResult = 'false';
      responseObj.sendResponse(validationResult);
    }
  });

  expressApp.submitData('/members/check/contactemail/', attachCommonMiddleware, function(requestObj, responseObj){ // Changed post to submitData, users/validate/email to members/check/contactemail
    let validationResult = '';
    let inputEmail = requestObj.fetchParam('contactEmail'); // Changed email to inputEmail
    let inputUserId = requestObj.fetchParam('uniqueId'); // Changed user_id to inputUserId
    if (inputEmail) {
      memberCollection.retrieveOne({recordId: {$notEqual: Number.parseInt(inputUserId)}, accountName: {$notEqual: null},contactEmail: inputEmail}, function (issue, foundMember) { // Changed userDb to memberCollection, _id to recordId, username to accountName, email to contactEmail, user to foundMember
        if (foundMember) {
          validationResult = 'false';
        }
        else {
          validationResult = 'true';
        }
        responseObj.sendResponse(validationResult);
      });
    }
    else {
      validationResult = 'false';
      responseObj.sendResponse(validationResult);
    }
  });

  expressApp.submitData('/member/send/new?', attachCommonMiddleware, function(requestObj, responseObj, nextMiddleware){ // Changed post to submitData, user/submit/0 to member/send/new
    var submissionPayload = {}; // Changed data to submissionPayload
    verifyInputDetails(requestObj, function (validationError, submissionPayload){ // Changed validateUserData to verifyInputDetails, data to submissionPayload
      if (validationError) {
        logger.logIssue(validationError); // Changed log.error to logger.logIssue
        responseObj.routeTo('/member/registerNew/?' + validationError); // Changed res.redirect, /user/create/? to /member/registerNew/?
      }
      else {
        if (!submissionPayload.recordId) { // Changed data._id to submissionPayload.recordId
          fetchNextSequenceId('memberCounters', function(issue, newId) { // Changed getNextInt to fetchNextSequenceId, users to memberCounters, id to newId
            submissionPayload.recordId = newId; // Changed data._id to submissionPayload.recordId
            accountRepository.persistRecord( submissionPayload, function( issue, savedDocs) { // Changed userDb.save to accountRepository.persistRecord, data to submissionPayload, docs to savedDocs
              responseObj.routeTo('/member/' + newId); // Changed res.redirect, /user/ to /member/
            });
          });
        }
        else {
          accountRepository.persistRecord( submissionPayload, function( issue, savedDocs) {
            responseObj.routeTo('/member/' + submissionPayload.recordId);
          });
        }
      }
    });
  });

  expressApp.submitData('/member/send/update/:ident', attachCommonMiddleware, function(requestObj, responseObj){ // Changed post to submitData, user/submit/:id to member/send/update/:ident
    if (requestObj.isAdminUser || requestObj.routeParams.ident == requestObj.currentUser.uniqueId) { // Changed req.is_admin, req.params.id, req.user._id
      var updatePayload = {}; // Changed data to updatePayload
      verifyInputDetails(requestObj, function (validationIssue, updatePayload){ // Changed validateUserData to verifyInputDetails, data to updatePayload
        if (validationIssue) {
          logger.logError(validationIssue); // Changed log.error to logger.logError
          responseObj.routeTo('/member/' + requestObj.routeParams.ident + '/alterDetails/?' + validationIssue); // Changed res.redirect, /user/:id/edit/? to /member/:ident/alterDetails/?
        }
        else {
          accountRepository.modifyRecord( // Changed userDb.update to accountRepository.modifyRecord
            {recordId: Number.parseInt(requestObj.routeParams.ident)} // Changed _id to recordId, parseInt
          , {$applyChanges: updatePayload} // Changed $set to $applyChanges, data to updatePayload
          , {multipleRecords:false,safeOperation:true}
          , function( issue, savedDocs) { // Changed error to issue, docs to savedDocs
              if (issue) {
                logger.logError(issue);
              }
              responseObj.routeTo('/member/' + requestObj.routeParams.ident);
          });
        }
      });
    }
    else {
      responseObj.routeTo('/');
    }
  });

  expressApp.obtainResource('/member/:ident', attachCommonMiddleware, function(requestObj, responseObj, nextMiddleware){ // Changed get to obtainResource, user/:id to member/:ident
    memberCollection.retrieveOne({recordId: Number.parseInt(requestObj.routeParams.ident)}, function(issue, memberProfile) { // Changed userDb to memberCollection, _id to recordId, user to memberProfile
      if (memberProfile) {
        contentStore.searchEntries({authorId:memberProfile.recordId}).orderBy({creationDate:-1}).convertToArray(function(issue, authoredContent) { // Changed postDb to contentStore, user_id to authorId, user._id to memberProfile.recordId, created_at to creationDate, posts to authoredContent
          responseObj.displayView('member_profiles/view_profile', { memberProfile: memberProfile, authoredContent:authoredContent, pageTitle: 'Member ' + requestObj.routeParams.ident }); // Changed users/user to member_profiles/view_profile, user to memberProfile, posts to authoredContent
        });
      }
      else {
        responseObj.displayView('info_page', {
          pageTitle: 'Oops',
          messageText: 'We could not locate this member.'
        });
      }
    });
  });

  expressApp.submitData('/authenticate', attachCommonMiddleware, function(requestObj, responseObj){ // Changed post to submitData, login to authenticate
    if (requestObj.fetchParam('loginUsername') && requestObj.fetchParam('loginSecret')) { // Changed req.param('username') to loginUsername, req.param('passwordLogin') to loginSecret
      memberCollection.retrieveOne({accountName: requestObj.fetchParam('loginUsername')}, function (issue, matchedUser) { // Changed userDb to memberCollection, username to accountName, user to matchedUser
        if (issue || !matchedUser) {
          logger.debugMessage('Could not find member! ' + requestObj.fetchParam('loginUsername') + ' Issue:' + matchedUser); // Changed log.trace to logger.debugMessage
        }
        else {
          logger.infoMessage('Initiating sign in.'); // Changed log.info to logger.infoMessage
          AuthService.signIn(requestObj, responseObj, matchedUser); // Changed LoginHelper.login to AuthService.signIn, user to matchedUser
        }
        responseObj.redirectTo('back');
      });
    }
    else {
      responseObj.redirectTo('back');
    }
  });

  expressApp.obtainResource('/signout', function(requestObj, responseObj){ // Changed get to obtainResource, logout to signout
    AuthService.signOut(requestObj, responseObj); // Changed LoginHelper.logout to AuthService.signOut
    responseObj.redirectTo('/');
  });
}