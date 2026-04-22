var bcrypt = require('bcrypt'); // Core library for hashing passwords
var LoginHelper = require('./login.js'); // Custom helper module for user authentication flows
var gravatar = require('gravatar'); // Library to generate Gravatar URLs for user avatars


// Function to validate user-provided data before creating or updating a user record.
validateUserData = function (req, callback) {
    // Initialize an empty array to accumulate any validation errors encountered.
    errors = [];
    // Initialize an empty object to store the processed and validated user data.
    data = {};

    // Check if a password parameter was provided in the request.
    if (req.param('password')) {
        // Enforce a minimum password length.
        if (req.param('password').length < 5) {
            errors.push('Password too short.');
        }
        // Verify that the password and its confirmation match.
        else if (req.param('password') !== req.param('password_confirm')) {
            // Include both password fields in the error message for debugging purposes.
            errors.push('Passwords did not match.' + req.param('password' + ' ' + req.param('password_confirm')));
        }
        // If password passes initial checks, hash it for storage.
        else {
            // Generate a cryptographic salt for secure password hashing.
            var salt = bcrypt.gen_salt_sync(10);
            // Hash the user's password using the generated salt.
            var hash = bcrypt.encrypt_sync(req.param('password'), salt);
            // Store the hashed password in the data object.
            data.password = hash;
        }
    }
    // If no password was provided and this is not an update operation (i.e., new user creation).
    else if (!req.param('id')) {
        errors.push('Password required.');
    }

    // Validate the presence of a username.
    if (!req.param('username')) {
        errors.push('Username required.');
    }

    // Validate the presence of a user's name.
    if (!req.param('name')) {
        errors.push('Name required.');
    }

    // Validate the email format using a regular expression.
    if (!/.*@.*\..*/.test(req.param('email'))) {
        errors.push('Valid email required.');
    }

    // Proceed only if there are no validation errors up to this point.
    if (errors.length == 0) {
        // Assign validated name, username, and email to the data object.
        data.name = req.param('name');
        data.username = req.param('username');
        data.email = req.param('email');

        // Determine the user's profile image.
        if (!req.param('image')) {
            // If no image is provided, use a default RoboHash image based on the user's name.
            data.image = "http://static1.robohash.com/" + data.name + ".png?set=set1&size=220x220";
        }
        else {
            // Otherwise, use the image URL provided in the request.
            data.image = req.param('image');
        }

        // Record the current timestamp as the last modification time.
        data.modified_at = new Date();
        // If no user ID is present in the request parameters, this is a new user, so record creation time.
        if (!req.params.id) {
            data.created_at = new Date();
        }

        // If the current authenticated user is a root user, allow setting root/admin flags.
        if (req.user.is_root) {
            data.is_root = req.param('is_root');
            data.is_admin = req.param('is_admin');
        }

        // Query the database to check for duplicate usernames or emails.
        userDb.find({
            _id: { $ne: parseInt(req.params.id) }, // Exclude the current user's ID if this is an update operation.
            $or: [{ username: req.param('username') }, // Check for existing username.
                  { email: req.param('email') }] // Check for existing email.
        }, function (error, users) {
            // If any existing users match the criteria.
            if (users.length > 0) {
                // Iterate through the found users to identify specific conflicts.
                for (var i in users) {
                    // Ensure the property is an own property and not from the prototype chain.
                    if (typeof users[i] !== 'function') {
                        // If a user with the same username is found, add an error.
                        if (users[i].username == req.param('username')) {
                            errors.push('Username already taken.');
                        }
                        // If a user with the same email and an existing username is found, add an error.
                        if (users[i].email == req.param('email') && users[i].username) {
                            errors.push('Email Address already taken.');
                        }
                        // If an email exists but without a username, it might indicate a partial user record to be updated.
                        else if (users[i].email == req.param('email') && !users[i].username) {
                            data._id = users[i]._id; // Assign the existing ID for potential merging.
                        }
                    }
                }
                // After checking for duplicates, if no new errors were added.
                if (errors.length == 0) {
                    callback(null, data); // Call back with no errors and the processed data.
                }
                else {
                    callback(errors); // Call back with the accumulated errors.
                }
            }
            // If no duplicate users were found.
            else {
                callback(null, data); // Call back with no errors and the processed data.
            }
        });
    }
    // If there were initial validation errors before database checks.
    else {
        callback(errors); // Call back with the initial errors.
    }
};


// Function to reset a user's password to a new randomly generated one.
resetPassword = function (userId, callback) {
    // A new random password will be generated.
    var newPassword = '';
    // Generate a 10-character random string for the new password.
    newPassword = newPassword.randomString(10); // Assumes `String.prototype.randomString` is defined elsewhere.

    // Generate a salt for hashing the new password.
    var salt = bcrypt.gen_salt_sync(10);
    // Hash the newly generated password.
    var hash = bcrypt.encrypt_sync(newPassword, salt);

    // Create a data object containing the new hashed password.
    var data = {};
    data.password = hash;

    // Update the user's record in the database with the new hashed password.
    userDb.update(
        { _id: parseInt(userId) }, // Query to find the user by their ID.
        { $set: data }, // Update operation to set the new password.
        { multi: false, safe: true }, // Options: ensure only one document is updated and write is safe.
        function (error, docs) {
            // Handle any errors during the database update.
            if (error) {
                callback(error); // Pass the error to the callback.
            }
            else {
                callback(null, newPassword); // Pass the new plain-text password (for email) to the callback.
            }
        }
    );
};


// Export a function that adds all user-related routes to the Express application.
exports.add_routes = function (app) {

    // Route to display a list of all active users.
    app.get('/users', loadGlobals, function (req, res) {
        // Find users who have a username (i.e., not partial or temporary records), sorted by name.
        userDb.find({ username: { $ne: null } }).sort({ name: 1 }).toArray(function (error, users) {
            // Log any errors encountered during the database query.
            if (error) {
                log.error(error);
            }
            else {
                // Render the 'users' view, passing the retrieved user list and page title.
                res.render('users', { users: users, title: 'Users' });
            }
        });
    });

    // Route to display the user editing form for a specific user ID.
    app.get('/user/:id/edit', loadGlobals, function (req, res, next) {
        // Authorize access: only admins or the user themselves can edit their profile.
        if (req.is_admin || req.params.id == req.user._id) {
            // Find the user's data by their ID.
            userDb.findOne({ _id: parseInt(req.params.id) }, function (error, user) {
                // Log any errors during the database lookup.
                if (error) {
                    log.error(error);
                }
                else {
                    // Define options for Gravatar image generation.
                    options = { s: '220', r: 'pg', d: 'monsterid' };
                    // Generate a Gravatar URL for the user's email.
                    user.gravitar = gravatar.url(user.email, options, https = false);
                    // Generate RoboHash image URLs for different sets.
                    user.robohash = "http://static1.robohash.com/" + user.name + ".png?set=set1&size=220x220";
                    user.robohash2 = "http://static1.robohash.com/" + user.name + ".png?set=set2&size=220x220";
                    user.robohash3 = "http://static1.robohash.com/" + user.name + ".png?set=set3&size=220x220";

                    // Determine which type of image the user is currently using (if any of the generated ones).
                    if (user.robohash == user.image) {
                        user.imageIsRoboHash = true;
                    }
                    else if (user.robohash2 == user.image) {
                        user.imageIsRobohash2 = true;
                    }
                    else if (user.robohash3 == user.image) {
                        user.imageIsRobohash3 = true;
                    }
                    else if (user.gravitar == user.image) {
                        user.imageIsGravitar = true;
                    }
                    // Render the user edit form, passing the user data and page title.
                    res.render('users/edit', {
                        user: user,
                        title: 'User ' + req.params.id,
                        headContent: 'user_edit'
                    });
                }
            });
        }
        else {
            // If unauthorized, redirect to the general users list.
            res.redirect('/users');
        }
    });

    // Route to handle user account removal.
    app.get('/user/:id/remove', loadGlobals, function (req, res, next) {
        // Prevent attempts to remove a user with a 'null' ID, redirect to users list.
        if (req.params.id === 'null') {
            res.redirect('/users');
        }
        // If the requesting user is an administrator, allow direct removal.
        if (req.is_admin) {
            userDb.remove({ _id: parseInt(req.params.id) }, function (error, id) {
                // Log any errors during the removal process.
                if (error) {
                    log.error(error);
                }
            });
            res.redirect('/users'); // Redirect to the users list after removal.
        }
        // If a user is attempting to delete their own account.
        else if (req.params.id == req.user._id) {
            // Check if a verification token is provided in the query string (from an email link).
            if (req.query.verify) {
                var verify = decodeURIComponent(req.query.verify);
                // Retrieve the user's information from the database.
                userDb.findOne({ _id: parseInt(req.params.id) }, function (error, user) {
                    // Compare the provided verification token with a generated hash based on user data.
                    if (bcrypt.compareSync(req.user._id + req.user.created_at, verify)) {
                        userDb.remove({ _id: parseInt(req.params.id) }, function (error, id) {
                            // Log any database errors during account removal.
                            if (error) {
                                log.error(error);
                            }
                        });
                        LoginHelper.logout(req, res); // Log out the user immediately after deletion.
                        res.render('default', {
                            title: 'Your account has been deleted',
                            text: 'Goodbye old friend.'
                        });
                    }
                    else {
                        // If verification fails, inform the user.
                        res.render('default', {
                            title: 'Couldn\'t Delete Account',
                            text: 'The verification string did not match, we couldn\'t delete your account. Try again maybe?'
                        });
                    }
                });
            }
            // If no verification token is present, send an email to the user for confirmation.
            else {
                var verifySalt = bcrypt.gen_salt_sync(10);
                var verifyHash = bcrypt.encrypt_sync(req.user._id + req.user.created_at, verifySalt);
                var deleteLink = siteInfo.site_url + "/user/" + req.params.id + "/remove?verify=" + verifyHash;
                var verificationMessage = "Hi!<br /> Click to verify that you want to delete your account: <a href=\"" + deleteLink + "\">" + deleteLink + "</a>";
                var verificationMessagePlain = "Hi! Go to this address to verify that you want to delete your account: " + deleteLink;

                // Use the server's email sending utility to send the verification link.
                server.send({
                    text: verificationMessagePlain,
                    from: 'Management <' + siteInfo.site_email + '>',
                    to: req.user.email,
                    subject: 'Confirm Account Removal',
                    attachment:
                    [{ data: verificationMessage, alternative: true }]
                }, function (err, message) { console.log(err || message); }); // Log the status of the email sending operation.

                res.render('default', {
                    title: 'Account Removel Request Sent',
                    text: 'We\'ve sent you an email with an account removal link. Go check your mail!'
                });
            }
        }
        // If the user is neither an admin nor deleting their own account, redirect.
        else {
            res.redirect('/users');
        }
    });

    // Route to display the form for creating a new user.
    app.get('/user/create', loadGlobals, function (req, res, next) {
        res.render('users/create', {
            title: 'New User',
            user: { _id: '', username: '', name: '', email: '' }, // Provide an empty user object for the form.
            headContent: 'user_create'
        });
    });

    // Route to display the 'Forgot Password' page.
    app.get('/forgot-password', loadGlobals, function (req, res, next) {
        res.render('users/forgot-password', {
            title: 'Forgot Password',
            passwordSent: req.query.passwordSent, // Indicates if a password reset email was just sent.
            password: '', // Placeholder for a new password if reset.
            error: req.query.error // Any error messages from previous attempts.
        });
    });

    // Route to handle the submission of the 'Forgot Password' form.
    app.post('/forgot-password', loadGlobals, function (req, res, next) {
        email = req.param('email');
        if (email) {
            // Find the user by the provided email address.
            userDb.findOne({ email: email }, function (error, user) {
                // If a user is found and they have a password (i.e., not a partial record).
                if (user && user.password) {
                    var name = user.name;
                    var oldPasswordHash = encodeURIComponent(user.password); // Encode the current hashed password for verification.
                    var userId = user._id;
                    var resetLink = siteInfo.site_url + "/reset-password/?userId=" + userId + "&verify=" + oldPasswordHash;
                    var resetMessage = "Hi " + name + "!<br /> Click to reset your password: <a href=\"" + resetLink + "\">" + resetLink + "</a>!";
                    var resetMessagePlain = "Hi " + name + "! Go to this address to reset your password: " + resetLink;

                    // Send the password reset email to the user.
                    server.send({
                        text: resetMessagePlain,
                        from: 'Management <' + siteInfo.site_email + '>',
                        to: email,
                        subject: 'Password Reset',
                        attachment:
                        [{ data: resetMessage, alternative: true }]
                    }, function (err, message) { console.log(err || message); }); // Log the email sending status.

                    res.redirect('/forgot-password/?passwordSent=true'); // Redirect to inform the user that an email was sent.
                }
                else {
                    res.redirect('/forgot-password/?error=AccountNotFound'); // Redirect with an error if user not found.
                }
            });
        }
        else {
            res.redirect('/forgot-password/?error=NoEmailGiven'); // Redirect with an error if no email was provided.
        }
    });

    // Route to handle the actual password reset from a verification link.
    app.get('/reset-password', loadGlobals, function (req, res, next) {
        var userId = req.query.userId;
        var verify = decodeURIComponent(req.query.verify);
        // Ensure both userId and verification token are present.
        if (userId && verify) {
            // Find the user by ID.
            userDb.findOne({ _id: parseInt(userId) }, function (error, user) {
                // If the user exists and the verification token matches their current hashed password.
                if (user && user.password == verify) {
                    // Call the resetPassword function to generate and update a new password.
                    resetPassword(userId, function (error, result) {
                        if (error) {
                            log.error(error); // Log any errors during the password reset process.
                            res.redirect('/forgot-password/?error=CouldNotReset'); // Redirect with an error message.
                        }
                        else {
                            // Render the forgot password page, showing the new password to the user.
                            res.render('users/forgot-password', {
                                title: 'Password Reset',
                                passwordSent: '',
                                password: result, // The newly generated plain-text password.
                                error: ''
                            });
                        }
                    });
                }
                else {
                    res.redirect('/forgot-password/?error=CouldNotFindUser'); // Redirect if user not found or verification fails.
                }
            });
        }
        else {
            res.redirect('/forgot-password/?error=noUserIdOrVerify'); // Redirect if required parameters are missing.
        }
    });

    // AJAX route to validate if a username is unique and available.
    app.post('/users/validate/username/', loadGlobals, function (req, res) {
        result = '';
        username = req.param('username');
        user_id = req.param('user_id'); // User ID is provided if editing an existing user.
        if (username) {
            // Find a user with the given username, excluding the current user if editing.
            userDb.findOne({ _id: { $ne: parseInt(user_id) }, username: username }, function (error, user) {
                if (error) {
                    log.error(error); // Log database query errors.
                }
                if (user) {
                    result = 'false'; // Username is taken.
                }
                else {
                    result = 'true'; // Username is available.
                }
                res.send(result); // Send the validation result.
            });
        }
        else {
            result = 'false'; // No username provided for validation.
            res.send(result);
        }
    });

    // AJAX route to validate if an email address is unique and available.
    app.post('/users/validate/email/', loadGlobals, function (req, res) {
        result = '';
        email = req.param('email');
        user_id = req.param('user_id'); // User ID is provided if editing an existing user.
        if (email) {
            // Find a user with the given email, excluding the current user and ensuring they have a username.
            userDb.findOne({ _id: { $ne: parseInt(user_id) }, username: { $ne: null }, email: email }, function (error, user) {
                if (user) {
                    result = 'false'; // Email is taken.
                }
                else {
                    result = 'true'; // Email is available.
                }
                res.send(result); // Send the validation result.
            });
        }
        else {
            result = 'false'; // No email provided for validation.
            res.send(result);
        }
    });

    // Route to handle submission of new user data (creation).
    app.post('/user/submit/0?', loadGlobals, function (req, res, next) {
        data = {};
        // Validate the incoming user data using the shared validation function.
        validateUserData(req, function (error, data) {
            if (error) {
                log.error(error); // Log validation errors.
                res.redirect('/user/create/?' + error); // Redirect back to create form with errors.
            }
            else {
                // If the data object does not have an _id, it implies a new user.
                if (!data._id) {
                    // Get the next available integer ID for the new user.
                    getNextInt('users', function (error, id) {
                        data._id = id; // Assign the new ID.
                        userDb.save(data, function (error, docs) {
                            res.redirect('/user/' + id); // Redirect to the newly created user's profile.
                        });
                    });
                }
                // If the data object already has an _id (e.g., from merging partial data), update the existing record.
                else {
                    userDb.save(data, function (error, docs) {
                        res.redirect('/user/' + data._id); // Redirect to the updated user's profile.
                    });
                }
            }
        });
    });

    // Route to handle submission of existing user data (update).
    app.post('/user/submit/:id', loadGlobals, function (req, res) {
        // Authorize access: only admins or the user themselves can submit changes to their profile.
        if (req.is_admin || req.params.id == req.user._id) {
            data = {};
            // Validate the incoming user data.
            validateUserData(req, function (error, data) {
                if (error) {
                    log.error(error); // Log validation errors.
                    res.redirect('/user/' + req.params.id + '/edit/?' + error); // Redirect back to edit form with errors.
                }
                else {
                    // Update the user's record in the database.
                    userDb.update(
                        { _id: parseInt(req.params.id) }, // Query to find the user by ID.
                        { $set: data }, // Set the updated data fields.
                        { multi: false, safe: true }, // Options: update a single document, ensure safe write.
                        function (error, docs) {
                            if (error) {
                                log.error(error); // Log any database errors during the update.
                            }
                            res.redirect('/user/' + req.params.id); // Redirect to the user's updated profile page.
                        }
                    );
                }
            });
        }
        else {
            res.redirect('/'); // If unauthorized, redirect to the home page.
        }
    });

    // Route to display a single user's profile page.
    app.get('/user/:id', loadGlobals, function (req, res, next) {
        // Find the user's data by their ID.
        userDb.findOne({ _id: parseInt(req.params.id) }, function (error, user) {
            if (user) {
                // If the user is found, retrieve all posts associated with this user, sorted by creation date.
                postDb.find({ user_id: user._id }).sort({ created_at: -1 }).toArray(function (error, posts) {
                    // Render the user profile page, passing user data, their posts, and the page title.
                    res.render('users/user', { user: user, posts: posts, title: 'User ' + req.params.id });
                });
            }
            else {
                // If the user is not found, render a default error page.
                res.render('default', {
                    title: 'Uh-oh',
                    text: 'We couldn\'t find this user.'
                });
            }
        });
    });

    // Route to handle user login attempts.
    app.post('/login', loadGlobals, function (req, res) {
        // Check if both username and password (for login) were provided.
        if (req.param('username') && req.param('passwordLogin')) {
            // Find the user by their username.
            userDb.findOne({ username: req.param('username') }, function (error, user) {
                // Log if the user could not be found or an error occurred.
                if (error || !user) {
                    log.trace('Couldn\'t find user! ' + req.param('username') + ' Error:' + user);
                }
                else {
                    log.info('loggin in.'); // Log successful user lookup.
                    LoginHelper.login(req, res, user); // Perform the login operation using the LoginHelper.
                }
                res.redirect('back'); // Redirect the user back to the page they came from.
            });
        }
        else {
            res.redirect('back'); // If username or password missing, redirect back without attempting login.
        }
    });

    // Route to handle user logout.
    app.get('/logout', function (req, res) {
        LoginHelper.logout(req, res); // Perform the logout operation.
        res.redirect('/'); // Redirect the user to the home page after logging out.
    });
};