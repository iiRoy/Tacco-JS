const cipherTool = require('bcrypt');
const sessionManager = require('./login.js');
const avatarService = require('gravatar');

// Assuming these are globally available or configured elsewhere,
// but renaming their references for divergence.
const accountRegistry = userDb;
const contentArchive = postDb;
const sequenceGenerator = getNextInt;
const mailerService = server;
const auditLogger = log;
const applicationInfo = siteInfo;

// --- Core Utility Functions (replacing direct calls and complex logic) ---

// Abstracts parameter extraction from request object
const fetchParameter = (requestObject, key) => {
  if (requestObject.params && Object.prototype.hasOwnProperty.call(requestObject.params, key)) return requestObject.params[key];
  if (requestObject.query && Object.prototype.hasOwnProperty.call(requestObject.query, key)) return requestObject.query[key];
  if (requestObject.body && Object.prototype.hasOwnProperty.call(requestObject.body, key)) return requestObject.body[key];
  return undefined;
};

// Asynchronous password hashing, replacing synchronous bcrypt.gen_salt_sync and bcrypt.encrypt_sync
const securePassphrase = async (plainTextValue) => {
  const saltValue = await cipherTool.genSalt(10);
  return await cipherTool.hash(plainTextValue, saltValue);
};

// Asynchronous password comparison, replacing synchronous bcrypt.compareSync
const checkPassphrase = async (plainTextValue, hashedValue) => {
  return await cipherTool.compare(plainTextValue, hashedValue);
};

// Generates a random alphanumeric string, replacing assumed String.prototype.randomString
const createRandomString = (length) => {
  const possibleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let resultString = '';
  for (let i = 0; i < length; i++) {
    resultString += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
  }
  return resultString;
};

// Generates a RoboHash image URL
const produceRoboHashUrl = (identifier, setId = 1) => {
  return `http://static1.robohash.com/${identifier}.png?set=set${setId}&size=220x220`;
};

// --- Promise-based Database & External Service Wrappers (replacing callback-style) ---

const promisifyDbFind = (dbInstance, query) => new Promise((resolve, reject) => {
  dbInstance.find(query, (error, result) => {
    if (error) reject(error);
    else resolve(result);
  });
});

const promisifyDbFindOne = (dbInstance, query) => new Promise((resolve, reject) => {
  dbInstance.findOne(query, (error, result) => {
    if (error) reject(error);
    else resolve(result);
  });
});

const promisifyDbUpdate = (dbInstance, query, updatePayload, updateOptions) => new Promise((resolve, reject) => {
  dbInstance.update(query, updatePayload, updateOptions, (error, affectedDocs) => {
    if (error) reject(error);
    else resolve(affectedDocs);
  });
});

const promisifyDbRemove = (dbInstance, query) => new Promise((resolve, reject) => {
  dbInstance.remove(query, (error, removedCount) => {
    if (error) reject(error);
    else resolve(removedCount);
  });
});

const promisifyDbSave = (dbInstance, documentData) => new Promise((resolve, reject) => {
  dbInstance.save(documentData, (error, savedDocument) => {
    if (error) reject(error);
    else resolve(savedDocument);
  });
});

const promisifyDbFindAndSort = (dbInstance, query, sortOrder) => new Promise((resolve, reject) => {
  dbInstance.find(query).sort(sortOrder).toArray((error, resultCollection) => {
    if (error) reject(error);
    else resolve(resultCollection);
  });
});

const promisifySequenceGenerator = (sequenceName) => new Promise((resolve, reject) => {
  sequenceGenerator(sequenceName, (error, nextId) => {
    if (error) reject(error);
    else resolve(nextId);
  });
});

const promisifyMailSender = (emailOptions) => new Promise((resolve, reject) => {
  mailerService.send(emailOptions, (error, mailResponse) => {
    if (error) reject(error);
    else resolve(mailResponse);
  });
});

// --- Core Business Logic Functions (replacing original functions) ---

// Replaces 'validateUserData'
const accountDataProcessor = async (requestContext) => {
  const collectedIssues = new Set();
  const processedProfileData = {};

  const incomingPassphrase = fetchParameter(requestContext, 'password');
  const incomingPassphraseConfirmation = fetchParameter(requestContext, 'password_confirm');
  const accountIdParam = fetchParameter(requestContext, 'id'); // For existing user edit

  if (incomingPassphrase) {
    if (incomingPassphrase.length < 5) {
      collectedIssues.add('Passphrase must be at least 5 characters long.');
    } else if (incomingPassphrase !== incomingPassphraseConfirmation) {
      collectedIssues.add('Passphrase and confirmation do not match.');
    } else {
      processedProfileData.password = await securePassphrase(incomingPassphrase);
    }
  } else if (!accountIdParam) { // If no password provided and it's a new user (no ID)
    collectedIssues.add('Passphrase is required for new accounts.');
  }

  const incomingUsername = fetchParameter(requestContext, 'username');
  if (!incomingUsername) {
    collectedIssues.add('Login username cannot be empty.');
  }

  const incomingName = fetchParameter(requestContext, 'name');
  if (!incomingName) {
    collectedIssues.add('Display name is mandatory.');
  }

  const incomingEmail = fetchParameter(requestContext, 'email');
  if (!/.*@.*\..*/.test(incomingEmail)) {
    collectedIssues.add('A valid email address format is required.');
  }

  if (collectedIssues.size > 0) {
    return { issues: Array.from(collectedIssues) };
  }

  processedProfileData.name = incomingName;
  processedProfileData.username = incomingUsername;
  processedProfileData.email = incomingEmail;

  const providedImage = fetchParameter(requestContext, 'image');
  processedProfileData.image = providedImage || produceRoboHashUrl(processedProfileData.name);
  processedProfileData.modified_at = new Date();

  // If creating a new user (no ID in params), set creation timestamp
  if (!requestContext.params.id) {
    processedProfileData.created_at = new Date();
  }

  // Check for root/admin privileges if principal is root
  if (requestContext.requestPrincipal && requestContext.requestPrincipal.is_root) {
    processedProfileData.is_root = fetchParameter(requestContext, 'is_root');
    processedProfileData.is_admin = fetchParameter(requestContext, 'is_admin');
  }

  try {
    const conflictingAccounts = await promisifyDbFind(accountRegistry, {
      _id: { $ne: parseInt(requestContext.params.id) }, // Exclude current user if editing
      $or: [{ username: incomingUsername }, { email: incomingEmail }]
    });

    conflictingAccounts.forEach(existingAccount => {
      if (existingAccount.username === incomingUsername) {
        collectedIssues.add('This username is already in use.');
      }
      if (existingAccount.email === incomingEmail) {
        if (existingAccount.username) {
          collectedIssues.add('This email address is already registered to another user.');
        } else {
          // Original logic: if email exists but no username, it means it's a "placeholder"
          // account to be updated. This is a specific behavior preserved.
          processedProfileData._id = existingAccount._id;
        }
      }
    });

    if (collectedIssues.size > 0) {
      return { issues: Array.from(collectedIssues) };
    }

    return { processedData: processedProfileData };
  } catch (error) {
    auditLogger.error("Account data processing failed during database lookup:", error);
    return { issues: ['System error during data validation.'] };
  }
};

// Replaces 'resetPassword'
const credentialResetter = async (accountIdentifier) => {
  try {
    const temporaryPassphrase = createRandomString(10);
    const hashedPassphrase = await securePassphrase(temporaryPassphrase);
    const updateDocument = { password: hashedPassphrase };

    await promisifyDbUpdate(
      accountRegistry,
      { _id: parseInt(accountIdentifier) },
      { $set: updateDocument },
      { multi: false, safe: true }
    );
    return { temporaryPassphrase };
  } catch (error) {
    auditLogger.error("Credential reset operation encountered an error for ID:", accountIdentifier, error);
    return { error };
  }
};

// --- Route Definition and Installation (replacing exports.add_routes) ---

// Renamed middleware
const contextInitializer = loadGlobals;

// Consolidated application endpoint definitions
const applicationEndpoints = [
  {
    method: 'get',
    path: '/users',
    middleware: [contextInitializer],
    handler: async (requestContext, responseStream) => {
      try {
        const allAccounts = await promisifyDbFindAndSort(accountRegistry, { username: { $ne: null } }, { name: 1 });
        responseStream.render('users', { users: allAccounts, title: 'Registered Accounts' });
      } catch (error) {
        auditLogger.error("Failed to retrieve user list:", error);
        responseStream.status(500).send('Server Error: Could not fetch user data.');
      }
    }
  },
  {
    method: 'get',
    path: '/user/:id/edit',
    middleware: [contextInitializer],
    handler: async (requestContext, responseStream, nextMiddleware) => {
      const targetIdentifier = parseInt(requestContext.params.id);
      const currentPrincipal = requestContext.requestPrincipal; // Renamed req.user

      if (currentPrincipal.is_admin || targetIdentifier === currentPrincipal._id) {
        try {
          const targetAccount = await promisifyDbFindOne(accountRegistry, { _id: targetIdentifier });
          if (!targetAccount) {
            return nextMiddleware(); // Account not found, proceed to 404 or next handler
          }

          const avatarOptions = { s: '220', r: 'pg', d: 'monsterid' };
          targetAccount.gravitar = avatarService.url(targetAccount.email, avatarOptions, false);
          targetAccount.robohash = produceRoboHashUrl(targetAccount.name, 1);
          targetAccount.robohash2 = produceRoboHashUrl(targetAccount.name, 2);
          targetAccount.robohash3 = produceRoboHashUrl(targetAccount.name, 3);

          const imageTypeIndicators = [
            { key: 'imageIsRoboHash', url: targetAccount.robohash },
            { key: 'imageIsRobohash2', url: targetAccount.robohash2 },
            { key: 'imageIsRobohash3', url: targetAccount.robohash3 },
            { key: 'imageIsGravitar', url: targetAccount.gravitar }
          ];

          imageTypeIndicators.forEach(indicator => {
            if (indicator.url === targetAccount.image) {
              targetAccount[indicator.key] = true;
            }
          });

          responseStream.render('users/edit', {
            user: targetAccount,
            title: `Account Editor: ${targetIdentifier}`,
            headContent: 'account_editor'
          });
        } catch (error) {
          auditLogger.error("Failed to load user for editing:", error);
          responseStream.status(500).send('Server Error: Could not load account data.');
        }
      } else {
        responseStream.redirect('/users');
      }
    }
  },
  {
    method: 'get',
    path: '/user/:id/remove',
    middleware: [contextInitializer],
    handler: async (requestContext, responseStream, nextMiddleware) => {
      const targetIdentifier = requestContext.params.id;
      const currentPrincipal = requestContext.requestPrincipal;

      if (targetIdentifier === 'null') {
        return responseStream.redirect('/users');
      }

      if (currentPrincipal.is_admin) {
        try {
          await promisifyDbRemove(accountRegistry, { _id: parseInt(targetIdentifier) });
          responseStream.redirect('/users');
        } catch (error) {
          auditLogger.error("Admin account removal failed:", error);
          responseStream.status(500).send('Server Error: Admin could not remove account.');
        }
      } else if (targetIdentifier == currentPrincipal._id) {
        const verificationToken = fetchParameter(requestContext, 'verify');

        if (verificationToken) {
          try {
            const tokenPayload = `${currentPrincipal._id}${currentPrincipal.created_at}`;
            if (await checkPassphrase(tokenPayload, decodeURIComponent(verificationToken))) {
              await promisifyDbRemove(accountRegistry, { _id: parseInt(targetIdentifier) });
              sessionManager.logout(requestContext, responseStream);
              responseStream.render('default', {
                title: 'Your Account Has Been Terminated',
                text: 'Farewell, old friend. Your account is no longer active.'
              });
            } else {
              responseStream.render('default', {
                title: 'Account Termination Failed',
                text: 'The verification token provided was invalid. Please try again or request a new link.'
              });
            }
          } catch (error) {
            auditLogger.error("Self account removal verification failed:", error);
            responseStream.status(500).send('Server Error: Self account removal failed.');
          }
        } else {
          try {
            const verificationSalt = await cipherTool.genSalt(10);
            const verificationHash = await cipherTool.hash(`${currentPrincipal._id}${currentPrincipal.created_at}`, verificationSalt);
            const terminationLink = `${applicationInfo.site_url}/user/${targetIdentifier}/remove?verify=${encodeURIComponent(verificationHash)}`;

            const emailHtmlContent = `Hello!<br /> To confirm your account termination, kindly click this link: <a href="${terminationLink}">${terminationLink}</a>`;
            const emailPlainContent = `Hello! Please visit this URL to confirm your account termination: ${terminationLink}`;

            await promisifyMailSender({
              text: emailPlainContent,
              from: `Management <${applicationInfo.site_email}>`,
              to: currentPrincipal.email,
              subject: 'Confirm Account Termination Request',
              attachment: [{ data: emailHtmlContent, alternative: true }]
            });

            responseStream.render('default', {
              title: 'Account Termination Request Dispatched',
              text: 'We\'ve sent an email to your registered address with a link to confirm account termination. Please check your inbox!'
            });
          } catch (error) {
            auditLogger.error("Failed to send account termination email:", error);
            responseStream.status(500).send('Server Error: Could not send termination email.');
          }
        }
      } else {
        responseStream.redirect('/users');
      }
    }
  },
  {
    method: 'get',
    path: '/user/create',
    middleware: [contextInitializer],
    handler: (requestContext, responseStream) => {
      responseStream.render('users/create', {
        title: 'New Account Registration',
        user: { _id: '', username: '', name: '', email: '' },
        headContent: 'account_registration'
      });
    }
  },
  {
    method: 'get',
    path: '/forgot-password',
    middleware: [contextInitializer],
    handler: (requestContext, responseStream) => {
      responseStream.render('users/forgot-password', {
        title: 'Forgotten Passphrase Recovery',
        passphraseDispatched: fetchParameter(requestContext, 'passwordSent'),
        passphrase: '',
        issue: fetchParameter(requestContext, 'error')
      });
    }
  },
  {
    method: 'post',
    path: '/forgot-password',
    middleware: [contextInitializer],
    handler: async (requestContext, responseStream) => {
      const emailAddress = fetchParameter(requestContext, 'email');
      if (emailAddress) {
        try {
          const registeredAccount = await promisifyDbFindOne(accountRegistry, { email: emailAddress });
          if (registeredAccount && registeredAccount.password) {
            const accountDisplayName = registeredAccount.name;
            const oldPassphraseHash = encodeURIComponent(registeredAccount.password);
            const accountId = registeredAccount._id;
            const resetProcedureLink = `${applicationInfo.site_url}/reset-password/?userId=${accountId}&verify=${oldPassphraseHash}`;

            const resetMessageHtml = `Hello ${accountDisplayName}!<br /> To initiate your passphrase reset, please click this link: <a href="${resetProcedureLink}">${resetProcedureLink}</a>!`;
            const resetMessagePlain = `Hello ${accountDisplayName}! Please visit this URL to reset your passphrase: ${resetProcedureLink}`;

            await promisifyMailSender({
              text: resetMessagePlain,
              from: `Management <${applicationInfo.site_email}>`,
              to: emailAddress,
              subject: 'Passphrase Reset Request Initiated',
              attachment: [{ data: resetMessageHtml, alternative: true }]
            });

            responseStream.redirect('/forgot-password/?passwordSent=true');
          } else {
            responseStream.redirect('/forgot-password/?error=AccountNotFound');
          }
        } catch (error) {
          auditLogger.error("Forgotten password process failed:", error);
          responseStream.status(500).send('Server Error: Password reset process failed.');
        }
      } else {
        responseStream.redirect('/forgot-password/?error=NoEmailGiven');
      }
    }
  },
  {
    method: 'get',
    path: '/reset-password',
    middleware: [contextInitializer],
    handler: async (requestContext, responseStream) => {
      const accountId = fetchParameter(requestContext, 'userId');
      const verificationToken = decodeURIComponent(fetchParameter(requestContext, 'verify') || '');

      if (accountId && verificationToken) {
        try {
          const targetAccount = await promisifyDbFindOne(accountRegistry, { _id: parseInt(accountId) });
          if (targetAccount && targetAccount.password === verificationToken) {
            const resetResult = await credentialResetter(accountId);
            if (resetResult.error) {
              auditLogger.error("Error during passphrase reset:", resetResult.error);
              responseStream.redirect('/forgot-password/?error=CouldNotReset');
            } else {
              responseStream.render('users/forgot-password', {
                title: 'Passphrase Successfully Reset',
                passphraseDispatched: '',
                passphrase: resetResult.temporaryPassphrase,
                issue: ''
              });
            }
          } else {
            responseStream.redirect('/forgot-password/?error=CouldNotFindUser');
          }
        } catch (error) {
          auditLogger.error("Passphrase reset verification failed:", error);
          responseStream.status(500).send('Server Error: Passphrase reset verification failed.');
        }
      } else {
        responseStream.redirect('/forgot-password/?error=noUserIdOrVerify');
      }
    }
  },
  {
    method: 'post',
    path: '/users/validate/username/',
    middleware: [contextInitializer],
    handler: async (requestContext, responseStream) => {
      const usernameCandidate = fetchParameter(requestContext, 'username');
      const currentProfileId = fetchParameter(requestContext, 'user_id');
      let validationResult = 'false'; // Default to invalid

      if (usernameCandidate) {
        try {
          const existingProfile = await promisifyDbFindOne(accountRegistry, {
            _id: { $ne: parseInt(currentProfileId) },
            username: usernameCandidate
          });
          validationResult = existingProfile ? 'false' : 'true';
        } catch (error) {
          auditLogger.error("Username validation database error:", error);
          validationResult = 'false';
        }
      }
      responseStream.send(validationResult);
    }
  },
  {
    method: 'post',
    path: '/users/validate/email/',
    middleware: [contextInitializer],
    handler: async (requestContext, responseStream) => {
      const emailCandidate = fetchParameter(requestContext, 'email');
      const currentProfileId = fetchParameter(requestContext, 'user_id');
      let validationResult = 'false'; // Default to invalid

      if (emailCandidate) {
        try {
          const existingProfile = await promisifyDbFindOne(accountRegistry, {
            _id: { $ne: parseInt(currentProfileId) },
            username: { $ne: null }, // Only check against users that have a username
            email: emailCandidate
          });
          validationResult = existingProfile ? 'false' : 'true';
        } catch (error) {
          auditLogger.error("Email validation database error:", error);
          validationResult = 'false';
        }
      }
      responseStream.send(validationResult);
    }
  },
  {
    method: 'post',
    path: '/user/submit/0?', // Handles both /user/submit and /user/submit/0
    middleware: [contextInitializer],
    handler: async (requestContext, responseStream, nextMiddleware) => {
      const processingOutcome = await accountDataProcessor(requestContext);

      if (processingOutcome.issues) {
        auditLogger.error('Account creation validation issues:', processingOutcome.issues);
        responseStream.redirect(`/user/create/?${processingOutcome.issues.map(encodeURIComponent).join('&')}`);
      } else {
        const finalAccountData = processingOutcome.processedData;
        try {
          if (!finalAccountData._id) { // New account creation
            const newAccountId = await promisifySequenceGenerator('users');
            finalAccountData._id = newAccountId;
            await promisifyDbSave(accountRegistry, finalAccountData);
            responseStream.redirect(`/user/${newAccountId}`);
          } else { // Special case: update existing placeholder account (email taken, no username)
            await promisifyDbSave(accountRegistry, finalAccountData); // save acts as upsert/update if _id exists
            responseStream.redirect(`/user/${finalAccountData._id}`);
          }
        } catch (error) {
          auditLogger.error('Account save operation failed:', error);
          responseStream.status(500).send('Server Error: Failed to save account.');
        }
      }
    }
  },
  {
    method: 'post',
    path: '/user/submit/:id',
    middleware: [contextInitializer],
    handler: async (requestContext, responseStream) => {
      const targetIdentifier = parseInt(requestContext.params.id);
      const currentPrincipal = requestContext.requestPrincipal;

      if (currentPrincipal.is_admin || targetIdentifier === currentPrincipal._id) {
        const processingOutcome = await accountDataProcessor(requestContext);

        if (processingOutcome.issues) {
          auditLogger.error('Account update validation issues:', processingOutcome.issues);
          responseStream.redirect(`/user/${targetIdentifier}/edit/?${processingOutcome.issues.map(encodeURIComponent).join('&')}`);
        } else {
          try {
            await promisifyDbUpdate(
              accountRegistry,
              { _id: targetIdentifier },
              { $set: processingOutcome.processedData },
              { multi: false, safe: true }
            );
            responseStream.redirect(`/user/${targetIdentifier}`);
          } catch (error) {
            auditLogger.error('Account update operation failed:', error);
            responseStream.status(500).send('Server Error: Failed to update account.');
          }
        }
      } else {
        responseStream.redirect('/');
      }
    }
  },
  {
    method: 'get',
    path: '/user/:id',
    middleware: [contextInitializer],
    handler: async (requestContext, responseStream) => {
      const targetIdentifier = parseInt(requestContext.params.id);
      try {
        const locatedAccount = await promisifyDbFindOne(accountRegistry, { _id: targetIdentifier });
        if (locatedAccount) {
          const associatedContent = await promisifyDbFindAndSort(contentArchive, { user_id: locatedAccount._id }, { created_at: -1 });
          responseStream.render('users/user', { user: locatedAccount, posts: associatedContent, title: `Account Profile: ${targetIdentifier}` });
        } else {
          responseStream.render('default', {
            title: 'Account Profile Not Found',
            text: 'We were unable to locate a user account with the specified identifier.'
          });
        }
      } catch (error) {
        auditLogger.error("Failed to retrieve user profile:", error);
        responseStream.status(500).send('Server Error: Could not retrieve profile.');
      }
    }
  },
  {
    method: 'post',
    path: '/login',
    middleware: [contextInitializer],
    handler: async (requestContext, responseStream) => {
      const loginUsername = fetchParameter(requestContext, 'username');
      const loginPassphrase = fetchParameter(requestContext, 'passwordLogin');

      if (loginUsername && loginPassphrase) {
        try {
          const identifiedAccount = await promisifyDbFindOne(accountRegistry, { username: loginUsername });
          if (!identifiedAccount) {
            auditLogger.trace(`Authentication attempt failed: User '${loginUsername}' not found.`);
          } else {
            auditLogger.info(`Attempting authentication for user: ${loginUsername}.`);
            sessionManager.login(requestContext, responseStream, identifiedAccount);
          }
        } catch (error) {
          auditLogger.trace(`Authentication database error for '${loginUsername}':`, error);
        }
      }
      responseStream.redirect('back');
    }
  },
  {
    method: 'get',
    path: '/logout',
    handler: (requestContext, responseStream) => {
      sessionManager.logout(requestContext, responseStream);
      responseStream.redirect('/');
    }
  }
];

// Main export function to install all defined endpoints onto an Express application instance
const installEndpointHandlers = (applicationInstance) => {
  applicationEndpoints.forEach(endpointDefinition => {
    const handlers = [...(endpointDefinition.middleware || []), endpointDefinition.handler];
    applicationInstance[endpointDefinition.method](endpointDefinition.path, ...handlers);
  });
};

// Export the new function instead of the original 'add_routes'
exports.installEndpointHandlers = installEndpointHandlers;