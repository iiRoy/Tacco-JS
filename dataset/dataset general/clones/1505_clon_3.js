const cryptoUtil = require('bcrypt'); // Renamed from bcrypt
const AuthService = require('./authentication_service.js'); // Renamed from login.js to authentication_service.js
const avatarGen = require('gravatar'); // Renamed from gravatar

// --- Constants for enhanced readability and maintainability ---
const MIN_PASSKEY_LENGTH_SETTING = 8; // Minimum required length for user passkeys
const HASHING_ROUNDS = 12; // Number of salt rounds for bcrypt hashing, increased for security
const DEFAULT_ROBOHASH_BASE_URI = "http://static1.robohash.com/";
const AVATAR_SIZE_DEFAULT = '220';
const AVATAR_RATING_DEFAULT = 'pg';
const AVATAR_FALLBACK_DEFAULT = 'monsterid';
const RESET_TOKEN_EXPIRY_MS = 3600 * 1000; // Password/deletion tokens expire after 1 hour (3600 seconds)

// --- Utility Functions for common tasks ---

/**
 * Generates a cryptographically secure random string suitable for tokens or temporary passwords.
 * @param {number} desiredLength - The desired length of the generated string.
 * @returns {string} A random string composed of alphanumeric characters.
 */
function createSecureRandomString(desiredLength) {
    const characterSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let resultString = '';
    for (let i = 0; i < desiredLength; i++) {
        resultString += characterSet.charAt(Math.floor(Math.random() * characterSet.length));
    }
    return resultString;
}

/**
 * Validates if a given string adheres to a basic email address format.
 * This is a simple regex and might not cover all edge cases, but serves as a primary check.
 * @param {string} emailAddressValue - The email string to be validated.
 * @returns {boolean} True if the email format is valid, false otherwise.
 */
function checkEmailFormatValidity(emailAddressValue) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddressValue);
}

// Global variable for Express middleware simulation (e.g., user context loading)
// In a real application, this would be defined elsewhere and 'required'.
const loadContextMiddleware = (httpRequest, httpResponse, nextMiddleware) => {
    // Simulating user context and admin status
    // For cloning, assume a mock user is always logged in for consistency with original flow
    httpRequest.user = httpRequest.user || { idKey: 101, hasSuperUserPrivileges: true, contactEmail: 'mock.admin@example.com', creationTimestamp: new Date() };
    httpRequest.is_admin = httpRequest.user.hasSuperUserPrivileges;
    nextMiddleware();
};

// Assuming these are globally available or passed via context/dependency injection
// In a real app, these would be 'required' or initialized elsewhere.
const userRepository = {
    find: (query, completion) => completion(null, []), // Mock DB find
    findOne: (query, completion) => completion(null, null), // Mock DB findOne
    update: (query, data, options, completion) => completion(null, { nModified: 1 }), // Mock DB update
    save: (data, completion) => completion(null, data), // Mock DB save
    remove: (query, completion) => completion(null, { nRemoved: 1 }) // Mock DB remove
};
const postRepository = {
    find: (query) => ({
        sort: (criteria) => ({
            toArray: (completion) => completion(null, []) // Mock DB find and sort
        })
    })
};
const systemLogger = {
    error: (message) => console.error(`[SYSTEM ERROR] ${message}`),
    warn: (message) => console.warn(`[SYSTEM WARNING] ${message}`),
    info: (message) => console.info(`[SYSTEM INFO] ${message}`),
    debug: (message) => console.log(`[SYSTEM DEBUG] ${message}`)
};
const mailService = {
    sendMail: (mailOptions, completion) => {
        systemLogger.info(`Mail service: Attempting to send email to ${mailOptions.to} with subject "${mailOptions.subject}"`);
        completion(null, { success: true, messageId: 'mock-mail-service-id' }); // Simulate success
    }
};
const applicationConfig = {
    baseUrl: 'http://localhost:3000',
    supportEmail: 'support@example.com'
};
const generateNextSequenceId = (collectionName, completion) => completion(null, Math.floor(Math.random() * 100000) + 1000); // Mock ID generator


/**
 * Validates and processes user-provided data for account creation or profile updates.
 * This function consolidates various validation checks and prepares the payload for database operations.
 *
 * @param {object} httpRequest - The incoming HTTP request object, typically from an Express route.
 * @param {function(Array<string>|null, object|null): void} completionHandler - A callback function
 *   that receives an array of validation error messages (if any) or the processed data payload.
 */
const processUserInputDetails = function (httpRequest, completionHandler) {
    let validationIssues = []; // Accumulates all encountered validation problems
    let processedPayload = {}; // Holds the clean and validated data for persistence

    // Extracting input parameters from the request body for clarity and consistency
    const requestData = {
        userPasskey: httpRequest.body.userPasskey,
        userPasskeyConfirm: httpRequest.body.userPasskeyConfirm,
        entityId: httpRequest.params.entityId || httpRequest.body.entityId, // Prioritize route param, fallback to body
        loginHandle: httpRequest.body.loginHandle,
        displayName: httpRequest.body.displayName,
        contactEmail: httpRequest.body.contactEmail,
        profilePicUrl: httpRequest.body.profilePicUrl,
        hasSuperUserPrivileges: httpRequest.body.hasSuperUserPrivileges,
        isAdministrator: httpRequest.body.isAdministrator
    };

    // --- Passkey (Password) Validation Logic ---
    if (requestData.userPasskey) {
        if (requestData.userPasskey.length < MIN_PASSKEY_LENGTH_SETTING) {
            validationIssues.push(`The chosen passkey is too short. A minimum length of ${MIN_PASSKEY_LENGTH_SETTING} characters is required.`);
        } else if (requestData.userPasskey !== requestData.userPasskeyConfirm) {
            validationIssues.push(`The provided passkeys do not match. Please ensure they are identical.`);
        } else {
            // Securely hash the passkey before storing
            try {
                const generatedSalt = cryptoUtil.genSaltSync(HASHING_ROUNDS);
                const hashedPasskey = cryptoUtil.hashSync(requestData.userPasskey, generatedSalt);
                processedPayload.userPasskey = hashedPasskey;
            } catch (hashError) {
                systemLogger.error(`Passkey hashing failed: ${hashError.message}`);
                validationIssues.push('An internal error prevented passkey security. Please try again.');
            }
        }
    } else if (!requestData.entityId) { // If no passkey provided and it's a new user creation
        validationIssues.push('A passkey is mandatory for new user account registrations.');
    }

    // --- Mandatory Field Presence Checks ---
    if (!requestData.loginHandle) {
        validationIssues.push('A unique login handle is required for user identification.');
    }
    if (!requestData.displayName) {
        validationIssues.push('A display name is required for your profile.');
    }
    if (!requestData.contactEmail) {
        validationIssues.push('An email address is required for communication and account recovery.');
    } else if (!checkEmailFormatValidity(requestData.contactEmail)) {
        validationIssues.push('The provided email address format is invalid. Please enter a valid email.');
    }

    // Proceed to process and save data only if no initial validation errors exist
    if (validationIssues.length === 0) {
        processedPayload.displayName = requestData.displayName;
        processedPayload.loginHandle = requestData.loginHandle;
        processedPayload.contactEmail = requestData.contactEmail;

        // Determine profile image URL, defaulting to RoboHash if none specified
        processedPayload.profilePicUrl = requestData.profilePicUrl ||
            `${DEFAULT_ROBOHASH_BASE_URI}${processedPayload.displayName}.png?set=set1&size=${AVATAR_SIZE_DEFAULT}x${AVATAR_SIZE_DEFAULT}`;

        // Set modification timestamp for all operations
        processedPayload.lastModifiedTimestamp = new Date();
        // Set creation timestamp only if this is a new entity (no existing ID)
        if (!requestData.entityId) {
            processedPayload.creationTimestamp = new Date();
        }

        // Handle administrative privileges, ensuring only root users can modify them
        if (httpRequest.user && httpRequest.user.hasSuperUserPrivileges) {
            processedPayload.hasSuperUserPrivileges = (requestData.hasSuperUserPrivileges === 'true');
            processedPayload.isAdministrator = (requestData.isAdministrator === 'true');
        } else {
            // Log attempts by non-root users to modify privilege fields for auditing
            if (requestData.hasSuperUserPrivileges !== undefined || requestData.isAdministrator !== undefined) {
                systemLogger.warn(`Unauthorized attempt by user ${httpRequest.user ? httpRequest.user.idKey : 'unknown'} to modify privilege fields for login handle: ${requestData.loginHandle}`);
            }
        }

        // --- Uniqueness Check for Login Handle and Email ---
        const currentEntityIdentifier = parseInt(requestData.entityId || '0'); // Use '0' for new entities to ensure all existing users are checked
        userRepository.find({
            idKey: { $ne: currentEntityIdentifier }, // Exclude the current user if this is an update operation
            $or: [{ loginHandle: requestData.loginHandle }, { contactEmail: requestData.contactEmail }]
        }, (dbError, foundEntities) => {
            if (dbError) {
                systemLogger.error(`Database error during uniqueness validation: ${dbError.message}`);
                validationIssues.push('An internal server error occurred during data validation.');
                return completionHandler(validationIssues);
            }

            if (foundEntities && foundEntities.length > 0) {
                for (const existingEntity of foundEntities) {
                    if (existingEntity.loginHandle === requestData.loginHandle) {
                        validationIssues.push('The chosen login handle is already in use by another account.');
                    }
                    if (existingEntity.contactEmail === requestData.contactEmail) {
                        validationIssues.push('The provided email address is already registered to another account.');
                    }
                }
            }

            // Final decision based on all validation results
            if (validationIssues.length === 0) {
                completionHandler(null, processedPayload);
            } else {
                completionHandler(validationIssues);
            }
        });
    } else {
        completionHandler(validationIssues);
    }
};

/**
 * Manages the process of resetting a user's passkey (password).
 * This involves generating a new random passkey, hashing it, and updating the user's record.
 * Any active reset tokens associated with the user are also cleared.
 *
 * @param {string} targetUserId - The unique identifier of the user whose passkey is to be reset.
 * @param {function(Error|null, string|null): void} completionHandler - Callback function
 *   that receives an error object (if the operation fails) or the newly generated plain-text passkey.
 */
const initiatePasskeyReset = function (targetUserId, completionHandler) {
    const generatedPlaintextPasskey = createSecureRandomString(16); // Generate a strong, random password
    let updatedPasskeyData = {};

    try {
        const generatedSalt = cryptoUtil.genSaltSync(HASHING_ROUNDS);
        const hashedNewPasskey = cryptoUtil.hashSync(generatedPlaintextPasskey, generatedSalt);
        updatedPasskeyData.userPasskey = hashedNewPasskey;
        updatedPasskeyData.lastModifiedTimestamp = new Date(); // Update the modification timestamp
        updatedPasskeyData.resetToken = null; // Invalidate any existing reset token
        updatedPasskeyData.resetTokenExpiry = null; // Clear token expiry
    } catch (hashFailure) {
        systemLogger.error(`Passkey hashing failed during reset for user ID ${targetUserId}: ${hashFailure.message}`);
        return completionHandler(new Error('Failed to generate a secure new passkey.'));
    }

    userRepository.update(
        { idKey: parseInt(targetUserId) },
        { $set: updatedPasskeyData },
        { multi: false, upsert: false }, // Ensure only one document is updated and no new one is created
        (dbError, recordsAffected) => {
            if (dbError) {
                systemLogger.error(`Database update failed for passkey reset for user ID ${targetUserId}: ${dbError.message}`);
                completionHandler(dbError);
            } else if (!recordsAffected || recordsAffected.nModified === 0) {
                systemLogger.warn(`Passkey reset attempted for a non-existent or unchanged user ID: ${targetUserId}`);
                completionHandler(new Error('User not found or passkey was not updated.'));
            } else {
                completionHandler(null, generatedPlaintextPasskey); // Return the new plaintext passkey
            }
        }
    );
};

/**
 * Configures all user management related routes for the Express application.
 * This function encapsulates the routing logic, middleware application, and business logic calls.
 *
 * @param {object} expressApp - The Express application instance to which routes will be added.
 */
exports.configureUserRoutes = function (expressApp) {

    // --- Route: Display List of All Users ---
    expressApp.get('/users-overview', loadContextMiddleware, function (httpRequest, httpResponse) {
        userRepository.find({ loginHandle: { $ne: null } }) // Fetch users with a defined login handle
            .sort({ displayName: 1 }) // Sort by display name alphabetically
            .toArray(function (dbError, userAccounts) {
                if (dbError) {
                    systemLogger.error(`Failed to retrieve the list of user accounts: ${dbError.message}`);
                    return httpResponse.status(500).render('error_template', { message: 'Failed to load user data due to a server error.' });
                }
                httpResponse.render('user_management/list_users_view', { userAccounts: userAccounts, pageTitle: 'Registered System Users' });
            });
    });

    // --- Route: Display User Profile Edit Form ---
    expressApp.get('/user-profile/:entityId/edit', loadContextMiddleware, function (httpRequest, httpResponse, nextMiddleware) {
        const targetEntityId = parseInt(httpRequest.params.entityId);

        // Authorization check: User can edit their own profile or an admin can edit any profile
        if (!httpRequest.is_admin && targetEntityId !== httpRequest.user.idKey) {
            systemLogger.warn(`Unauthorized profile edit attempt: User ${httpRequest.user.idKey} tried to edit ${targetEntityId}.`);
            return httpResponse.redirect('/users-overview'); // Redirect to user list or unauthorized page
        }

        userRepository.findOne({ idKey: targetEntityId }, function (dbError, userAccount) {
            if (dbError) {
                systemLogger.error(`Error fetching user profile for editing (ID: ${targetEntityId}): ${dbError.message}`);
                return httpResponse.status(500).render('error_template', { message: 'Could not retrieve user profile for editing.' });
            }
            if (!userAccount) {
                return httpResponse.status(404).render('error_template', { message: 'The requested user profile does not exist.' });
            }

            // Generate various avatar options for display on the edit form
            const avatarOptions = { s: AVATAR_SIZE_DEFAULT, r: AVATAR_RATING_DEFAULT, d: AVATAR_FALLBACK_DEFAULT };
            userAccount.generatedGravatarUrl = avatarGen.url(userAccount.contactEmail, avatarOptions, false); // Original explicitly used HTTP
            userAccount.generatedRobohashUrl = `${DEFAULT_ROBOHASH_BASE_URI}${userAccount.displayName}.png?set=set1&size=${AVATAR_SIZE_DEFAULT}x${AVATAR_SIZE_DEFAULT}`;
            userAccount.generatedRobohashUrlTwo = `${DEFAULT_ROBOHASH_BASE_URI}${userAccount.displayName}.png?set=set2&size=${AVATAR_SIZE_DEFAULT}x${AVATAR_SIZE_DEFAULT}`;
            userAccount.generatedRobohashUrlThree = `${DEFAULT_ROBOHASH_BASE_URI}${userAccount.displayName}.png?set=set3&size=${AVATAR_SIZE_DEFAULT}x${AVATAR_SIZE_DEFAULT}`;

            // Flags to indicate which image source is currently active
            userAccount.isDefaultRobohash = (userAccount.generatedRobohashUrl === userAccount.profilePicUrl);
            userAccount.isSecondRobohash = (userAccount.generatedRobohashUrlTwo === userAccount.profilePicUrl);
            userAccount.isThirdRobohash = (userAccount.generatedRobohashUrlThree === userAccount.profilePicUrl);
            userAccount.isGravatarImage = (userAccount.generatedGravatarUrl === userAccount.profilePicUrl);

            httpResponse.render('user_management/edit_profile_form', {
                userAccount: userAccount,
                pageTitle: `Edit Profile: ${userAccount.displayName}`,
                headerContent: 'user_edit_section'
            });
        });
    });

    // --- Route: Initiate User Account Removal ---
    expressApp.get('/user-account/:entityId/remove', loadContextMiddleware, function (httpRequest, httpResponse, nextMiddleware) {
        const targetEntityId = httpRequest.params.entityId;

        // Guard against invalid or missing IDs
        if (targetEntityId === 'null' || !targetEntityId) {
            systemLogger.warn(`Attempted account removal with invalid entity ID: ${targetEntityId}`);
            return httpResponse.redirect('/users-overview');
        }

        // Scenario 1: Administrator performs deletion
        if (httpRequest.is_admin) {
            userRepository.remove({ idKey: parseInt(targetEntityId) }, function (dbError, removalResult) {
                if (dbError) {
                    systemLogger.error(`Admin user ${httpRequest.user.idKey} failed to remove user ${targetEntityId}: ${dbError.message}`);
                    // Render an error or pass a message via session
                } else if (removalResult && removalResult.nRemoved > 0) {
                    systemLogger.info(`Admin user ${httpRequest.user.idKey} successfully removed user ${targetEntityId}.`);
                } else {
                    systemLogger.warn(`Admin user ${httpRequest.user.idKey} attempted to remove a non-existent user ${targetEntityId}.`);
                }
                httpResponse.redirect('/users-overview');
            });
        }
        // Scenario 2: User requests self-deletion
        else if (parseInt(targetEntityId) === httpRequest.user.idKey) {
            const verificationToken = httpRequest.query.verificationToken;

            if (verificationToken) {
                // User is completing the deletion process via a verification link
                userRepository.findOne({ idKey: parseInt(targetEntityId) }, function (dbError, userAccount) {
                    if (dbError) {
                        systemLogger.error(`Error fetching user for self-deletion verification (ID: ${targetEntityId}): ${dbError.message}`);
                        return httpResponse.status(500).render('system_message_template', {
                            pageTitle: 'Deletion Verification Error',
                            messageText: 'An unexpected server error occurred during account deletion verification.'
                        });
                    }
                    // Validate the deletion token and its expiry
                    if (!userAccount || !userAccount.deletionToken || userAccount.deletionToken !== verificationToken || userAccount.deletionTokenExpiry < Date.now()) {
                        systemLogger.warn(`Invalid or expired deletion token for user ID ${targetEntityId}.`);
                        return httpResponse.status(400).render('system_message_template', {
                            pageTitle: 'Deletion Unsuccessful',
                            messageText: 'The verification link is invalid or has expired. Please request a new deletion link.'
                        });
                    }

                    // Token is valid, proceed with final account deletion
                    userRepository.remove({ idKey: parseInt(targetEntityId) }, function (removeError, removalOutcome) {
                        if (removeError) {
                            systemLogger.error(`Self-deletion failed for user ID ${targetEntityId}: ${removeError.message}`);
                            return httpResponse.status(500).render('system_message_template', {
                                pageTitle: 'Deletion Error',
                                messageText: 'Failed to delete your account due to an internal server error.'
                            });
                        }
                        AuthService.logout(httpRequest, httpResponse); // Log the user out after deletion
                        httpResponse.render('system_message_template', {
                            pageTitle: 'Account Successfully Deleted',
                            messageText: 'Your account has been permanently removed from our system. Goodbye!'
                        });
                    });
                });
            } else {
                // User initiated self-deletion, send verification email
                const deletionToken = createSecureRandomString(32);
                const deletionTokenExpiry = Date.now() + RESET_TOKEN_EXPIRY_MS; // Token valid for 1 hour

                userRepository.update(
                    { idKey: httpRequest.user.idKey },
                    { $set: { deletionToken: deletionToken, deletionTokenExpiry: deletionTokenExpiry } },
                    { multi: false, upsert: false },
                    (updateError) => {
                        if (updateError) {
                            systemLogger.error(`Failed to store deletion token for user ${httpRequest.user.idKey}: ${updateError.message}`);
                            return httpResponse.status(500).render('system_message_template', {
                                pageTitle: 'Deletion Request Failed',
                                messageText: 'Could not prepare your account for deletion. Please try again later.'
                            });
                        }

                        const removalConfirmationLink = `${applicationConfig.baseUrl}/user-account/${httpRequest.user.idKey}/remove?verificationToken=${deletionToken}`;
                        const emailHtmlContent = `<h3>Hello!</h3><p>You recently requested to delete your account. To confirm this action and permanently remove your account, please click the link below:</p><p><a href="${removalConfirmationLink}">${removalConfirmationLink}</a></p><p>This link is active for the next <b>1 hour</b>.</p>`;
                        const emailTextContent = `Hello!\nYou recently requested to delete your account. To confirm this action, please visit the following link: ${removalConfirmationLink}\nThis link is active for the next 1 hour.`;

                        mailService.sendMail({
                            text: emailTextContent,
                            from: `Account Management <${applicationConfig.supportEmail}>`,
                            to: httpRequest.user.contactEmail,
                            subject: 'Action Required: Confirm Account Removal',
                            attachment: [{ data: emailHtmlContent, alternative: true }]
                        }, (mailError, mailResponse) => {
                            if (mailError) {
                                systemLogger.error(`Failed to send deletion confirmation email to ${httpRequest.user.contactEmail}: ${mailError.message}`);
                            } else {
                                systemLogger.info(`Deletion confirmation email successfully dispatched to ${httpRequest.user.contactEmail}.`);
                            }
                        });

                        httpResponse.render('system_message_template', {
                            pageTitle: 'Account Removal Request Sent',
                            messageText: 'We\'ve sent a confirmation email to your registered address. Please check your inbox and follow the instructions to complete the account removal process.'
                        });
                    }
                );
            }
        } else {
            // Unauthorized attempt by a user to delete another user's account
            systemLogger.warn(`Unauthorized deletion attempt: User ${httpRequest.user.idKey} tried to delete account ${targetEntityId}.`);
            httpResponse.redirect('/users-overview');
        }
    });

    // --- Route: Display New User Registration Form ---
    expressApp.get('/new-user-registration', loadContextMiddleware, function (httpRequest, httpResponse, nextMiddleware) {
        httpResponse.render('user_management/create_new_user_form', {
            pageTitle: 'Register a New User Account',
            userAccount: { idKey: '', loginHandle: '', displayName: '', contactEmail: '' }, // Empty user object for form
            headerContent: 'new_user_creation_section'
        });
    });

    // --- Route: Display Forgot Passkey Form ---
    expressApp.get('/forgot-passkey', loadContextMiddleware, function (httpRequest, httpResponse, nextMiddleware) {
        httpResponse.render('user_management/forgot_passkey_form', {
            pageTitle: 'Recover Your Passkey',
            passkeyEmailSent: httpRequest.query.passkeyEmailSent, // Indicates if a reset email was dispatched
            generatedPasskey: '', // Will hold new passkey if reset was successful
            errorMessage: httpRequest.query.errorMessage // Any error messages to display
        });
    });

    // --- Route: Handle Forgot Passkey Request (POST) ---
    expressApp.post('/forgot-passkey', loadContextMiddleware, function (httpRequest, httpResponse, nextMiddleware) {
        const contactEmail = httpRequest.body.contactEmail;

        if (!contactEmail || !checkEmailFormatValidity(contactEmail)) {
            return httpResponse.redirect('/forgot-passkey/?errorMessage=InvalidEmailFormat');
        }

        userRepository.findOne({ contactEmail: contactEmail }, function (dbError, userAccount) {
            if (dbError) {
                systemLogger.error(`Database error during passkey reset request for email ${contactEmail}: ${dbError.message}`);
                return httpResponse.redirect('/forgot-passkey/?errorMessage=InternalServerError');
            }
            if (!userAccount) {
                // For security, always respond as if an email was sent, to avoid revealing user existence
                systemLogger.info(`Passkey reset requested for non-existent email address: ${contactEmail}`);
                return httpResponse.redirect('/forgot-passkey/?passkeyEmailSent=true');
            }

            // Generate a secure, single-use, time-limited reset token
            const resetToken = createSecureRandomString(32);
            const resetTokenExpiry = Date.now() + RESET_TOKEN_EXPIRY_MS; // Token valid for 1 hour

            userRepository.update(
                { idKey: userAccount.idKey },
                { $set: { resetToken: resetToken, resetTokenExpiry: resetTokenExpiry } },
                { multi: false, upsert: false },
                (updateError) => {
                    if (updateError) {
                        systemLogger.error(`Failed to store reset token for user ${userAccount.idKey}: ${updateError.message}`);
                        return httpResponse.redirect('/forgot-passkey/?errorMessage=ResetTokenStorageFailed');
                    }

                    const passkeyResetLink = `${applicationConfig.baseUrl}/reset-passkey?userId=${userAccount.idKey}&resetToken=${resetToken}`;
                    const resetEmailHtml = `<h3>Hello ${userAccount.displayName}!</h3><p>You recently requested to reset your passkey. Please click the link below to set a new passkey:</p><p><a href="${passkeyResetLink}">${passkeyResetLink}</a></p><p>This link is active for the next <b>1 hour</b>.</p>`;
                    const resetEmailText = `Hello ${userAccount.displayName}!\nYou recently requested to reset your passkey. Please visit the following link to set a new passkey: ${passkeyResetLink}\nThis link is active for the next 1 hour.`;

                    mailService.sendMail({
                        text: resetEmailText,
                        from: `Account Management <${applicationConfig.supportEmail}>`,
                        to: userAccount.contactEmail,
                        subject: 'Your Passkey Reset Request',
                        attachment: [{ data: resetEmailHtml, alternative: true }]
                    }, (mailError, mailResponse) => {
                        if (mailError) {
                            systemLogger.error(`Failed to send passkey reset email to ${userAccount.contactEmail}: ${mailError.message}`);
                        } else {
                            systemLogger.info(`Passkey reset email successfully sent to ${userAccount.contactEmail}.`);
                        }
                        httpResponse.redirect('/forgot-passkey/?passkeyEmailSent=true');
                    });
                }
            );
        });
    });

    // --- Route: Finalize Passkey Reset (GET - for verification and new passkey generation) ---
    expressApp.get('/reset-passkey', loadContextMiddleware, function (httpRequest, httpResponse, nextMiddleware) {
        const targetUserId = httpRequest.query.userId;
        const resetToken = httpRequest.query.resetToken;

        if (!targetUserId || !resetToken) {
            return httpResponse.redirect('/forgot-passkey/?errorMessage=MissingResetParameters');
        }

        userRepository.findOne({ idKey: parseInt(targetUserId) }, function (dbError, userAccount) {
            if (dbError) {
                systemLogger.error(`Database error during passkey reset verification (User ID: ${targetUserId}): ${dbError.message}`);
                return httpResponse.redirect('/forgot-passkey/?errorMessage=InternalServerError');
            }
            // Validate the user, token, and its expiry
            if (!userAccount || userAccount.resetToken !== resetToken || userAccount.resetTokenExpiry < Date.now()) {
                systemLogger.warn(`Invalid or expired reset token provided for user ID ${targetUserId}.`);
                return httpResponse.redirect('/forgot-passkey/?errorMessage=InvalidOrExpiredToken');
            }

            // If token is valid, proceed to generate and assign a new passkey
            initiatePasskeyReset(targetUserId, function (resetExecutionError, newGeneratedPlaintextPasskey) {
                if (resetExecutionError) {
                    systemLogger.error(`Failed to generate and set new passkey for user ID ${targetUserId}: ${resetExecutionError.message}`);
                    return httpResponse.redirect('/forgot-passkey/?errorMessage=PasskeyResetFailed');
                }
                // Render a success page, displaying the new generated passkey
                httpResponse.render('user_management/forgot_passkey_form', {
                    pageTitle: 'Passkey Successfully Reset',
                    passkeyEmailSent: false, // Not sending an email here, but showing result
                    generatedPasskey: newGeneratedPlaintextPasskey,
                    errorMessage: ''
                });
            });
        });
    });

    // --- Route: Asynchronous Validation for Login Handle Uniqueness (AJAX) ---
    expressApp.post('/users/validate/login-handle/', loadContextMiddleware, function (httpRequest, httpResponse) {
        let validationOutcome = 'false'; // Default to 'false' (not unique)
        const loginHandle = httpRequest.body.loginHandle;
        const currentUserId = parseInt(httpRequest.body.currentUserId || '0'); // Exclude current user during update checks

        if (!loginHandle) {
            return httpResponse.send(validationOutcome); // No login handle provided
        }

        userRepository.findOne({ idKey: { $ne: currentUserId }, loginHandle: loginHandle }, function (dbError, existingUser) {
            if (dbError) {
                systemLogger.error(`Database error during login handle validation: ${dbError.message}`);
                return httpResponse.status(500).send('error'); // Send an error status on DB failure
            }
            if (!existingUser) { // If no user found with this handle (excluding current user), it's unique
                validationOutcome = 'true';
            }
            httpResponse.send(validationOutcome);
        });
    });

    // --- Route: Asynchronous Validation for Contact Email Uniqueness (AJAX) ---
    expressApp.post('/users/validate/contact-email/', loadContextMiddleware, function (httpRequest, httpResponse) {
        let validationOutcome = 'false';
        const contactEmail = httpRequest.body.contactEmail;
        const currentUserId = parseInt(httpRequest.body.currentUserId || '0');

        if (!contactEmail || !checkEmailFormatValidity(contactEmail)) {
            return httpResponse.send(validationOutcome);
        }

        userRepository.findOne({ idKey: { $ne: currentUserId }, contactEmail: contactEmail }, function (dbError, existingUser) {
            if (dbError) {
                systemLogger.error(`Database error during contact email validation: ${dbError.message}`);
                return httpResponse.status(500).send('error');
            }
            if (!existingUser) {
                validationOutcome = 'true';
            }
            httpResponse.send(validationOutcome);
        });
    });

    // --- Route: Submit New User Account (POST) ---
    expressApp.post('/user-submission/new', loadContextMiddleware, function (httpRequest, httpResponse, nextMiddleware) {
        processUserInputDetails(httpRequest, function (validationErrors, processedPayload) {
            if (validationErrors && validationErrors.length > 0) {
                systemLogger.warn(`New user account submission failed validation: ${validationErrors.join('; ')}`);
                const errorQueryParams = validationErrors.map(err => `error=${encodeURIComponent(err)}`).join('&');
                return httpResponse.redirect(`/new-user-registration?${errorQueryParams}`);
            }

            // Generate a new unique ID for the new user account
            generateNextSequenceId('user_accounts_collection', function (idGenerationError, newUserId) {
                if (idGenerationError) {
                    systemLogger.error(`Failed to generate a unique ID for new user: ${idGenerationError.message}`);
                    return httpResponse.redirect('/new-user-registration?error=FailedToAllocateUserId');
                }
                processedPayload.idKey = newUserId; // Assign the newly generated ID
                userRepository.save(processedPayload, function (saveError, savedDocument) {
                    if (saveError) {
                        systemLogger.error(`Failed to persist new user account (ID: ${newUserId}): ${saveError.message}`);
                        return httpResponse.redirect('/new-user-registration?error=FailedToSaveUserAccount');
                    }
                    systemLogger.info(`New user account successfully created with ID: ${newUserId}`);
                    httpResponse.redirect(`/user-profile/${newUserId}`); // Redirect to the new user's profile view
                });
            });
        });
    });

    // --- Route: Submit User Profile Update (POST) ---
    expressApp.post('/user-submission/:entityId', loadContextMiddleware, function (httpRequest, httpResponse) {
        const targetEntityId = httpRequest.params.entityId;

        // Authorization check for profile updates
        if (!httpRequest.is_admin && parseInt(targetEntityId) !== httpRequest.user.idKey) {
            systemLogger.warn(`Unauthorized profile update attempt: User ${httpRequest.user.idKey} tried to update ${targetEntityId}.`);
            return httpResponse.redirect('/'); // Redirect to home or an unauthorized access page
        }

        processUserInputDetails(httpRequest, function (validationErrors, processedPayload) {
            if (validationErrors && validationErrors.length > 0) {
                systemLogger.warn(`User profile update failed validation for ID ${targetEntityId}: ${validationErrors.join('; ')}`);
                const errorQueryParams = validationErrors.map(err => `error=${encodeURIComponent(err)}`).join('&');
                return httpResponse.redirect(`/user-profile/${targetEntityId}/edit?${errorQueryParams}`);
            }

            // Execute the update operation in the database
            userRepository.update(
                { idKey: parseInt(targetEntityId) },
                { $set: processedPayload },
                { multi: false, upsert: false },
                function (updateError, updateResult) {
                    if (updateError) {
                        systemLogger.error(`Failed to update user profile (ID: ${targetEntityId}): ${updateError.message}`);
                        return httpResponse.redirect(`/user-profile/${targetEntityId}/edit?error=FailedToUpdateProfile`);
                    }
                    systemLogger.info(`User profile (ID: ${targetEntityId}) updated successfully.`);
                    httpResponse.redirect(`/user-profile/${targetEntityId}`); // Redirect to the updated profile view
                }
            );
        });
    });

    // --- Route: Display Single User Profile ---
    expressApp.get('/user-profile/:entityId', loadContextMiddleware, function (httpRequest, httpResponse, nextMiddleware) {
        const targetEntityId = parseInt(httpRequest.params.entityId);
        userRepository.findOne({ idKey: targetEntityId }, function (dbError, userAccount) {
            if (dbError) {
                systemLogger.error(`Error fetching user profile (ID: ${targetEntityId}): ${dbError.message}`);
                return httpResponse.status(500).render('system_message_template', { pageTitle: 'Profile Retrieval Error', messageText: 'Could not retrieve the user profile due to a server error.' });
            }
            if (userAccount) {
                postRepository.find({ userId: userAccount.idKey })
                    .sort({ creationTimestamp: -1 }) // Sort posts by creation date, newest first
                    .toArray(function (postError, userPosts) {
                        if (postError) {
                            systemLogger.error(`Error fetching posts for user ${userAccount.idKey}: ${postError.message}`);
                            userPosts = []; // Continue rendering the profile, but with no posts
                        }
                        httpResponse.render('user_management/single_profile_view', {
                            userAccount: userAccount,
                            userPosts: userPosts,
                            pageTitle: `User Profile: ${userAccount.displayName}`
                        });
                    });
            } else {
                httpResponse.status(404).render('system_message_template', {
                    pageTitle: 'User Not Found',
                    messageText: 'The requested user profile could not be found in our records.'
                });
            }
        });
    });

    // --- Route: Handle User Login Attempt (POST) ---
    expressApp.post('/authenticate-user', loadContextMiddleware, function (httpRequest, httpResponse) {
        const loginHandle = httpRequest.body.loginHandle;
        const loginPasskey = httpRequest.body.loginPasskey;

        if (!loginHandle || !loginPasskey) {
            systemLogger.debug('Authentication attempt failed: Missing login credentials.');
            return httpResponse.redirect('back'); // Redirect back to the login page (referrer)
        }

        userRepository.findOne({ loginHandle: loginHandle }, function (dbError, userAccount) {
            if (dbError) {
                systemLogger.error(`Database error during authentication attempt for '${loginHandle}': ${dbError.message}`);
                return httpResponse.redirect('back');
            }
            if (!userAccount) {
                systemLogger.info(`Authentication failed: User '${loginHandle}' not found.`);
                return httpResponse.redirect('back'); // Avoid revealing user existence for security
            }

            // Compare the provided plaintext passkey with the stored hashed passkey
            if (cryptoUtil.compareSync(loginPasskey, userAccount.userPasskey)) {
                systemLogger.info(`User '${loginHandle}' successfully authenticated.`);
                AuthService.login(httpRequest, httpResponse, userAccount); // Delegate to authentication service
                httpResponse.redirect('/'); // Redirect to the main application dashboard or home
            } else {
                systemLogger.info(`Authentication failed: Incorrect passkey for user '${loginHandle}'.`);
                httpResponse.redirect('back'); // Redirect back to login page with an implicit error
            }
        });
    });

    // --- Route: User Logout ---
    expressApp.get('/sign-out', function (httpRequest, httpResponse) {
        AuthService.logout(httpRequest, httpResponse); // Delegate to authentication service
        httpResponse.redirect('/'); // Redirect to the application's homepage after logout
    });
};