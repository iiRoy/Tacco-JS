// This file, jsonFS.js, provides a FUSE-based filesystem interface
// for navigating and manipulating JSON objects.
//
// Copyright (c) 2012 - 2014 by VMware, Inc. All Rights Reserved.
// For more information, visit: http://www.vmware.com
// Refer to the accompanying LICENSE.txt file for details of distribution and use.
//

var f4js = require('fuse4js'); // Fuse4js library for FUSE bindings
var fs = require('fs');       // Node.js file system module

// The JSON object that will be exposed as a virtual file system.
var obj = null;

// Configuration options for the file system.
// These are parsed from command-line arguments.
var options = {};

//-----------------------------------------------------------------------------
// Core utility function for navigating the JSON object structure.
//-----------------------------------------------------------------------------

/**
 * @function lookup
 * @description Given a root object and a file path, this function traverses
 *              the object structure to find the corresponding sub-object.
 * @param {object} root - The starting point for the lookup (e.g., the main JSON object).
 * @param {string} path - The slash-separated path to the desired node.
 * @returns {object} An object containing:
 *                   - `node`: The found sub-object or `undefined` if not found.
 *                   - `parent`: The parent object of the found node.
 *                   - `name`: The key/name of the found node within its parent.
 */
function lookup(root, path) {
    var cur = null,
        previous = null,
        name = '';

    // If the path is the root directory, return the root object itself.
    if (path === '/') {
        return { node: root, parent: null, name: '' };
    }

    // Split the path into components (directory/file names).
    comps = path.split('/');

    // Iterate through path components to traverse the JSON object.
    for (i = 0; i < comps.length; ++i) {
        previous = cur; // Keep track of the parent node.

        if (i == 0) {
            cur = root; // Start with the root for the first component.
        } else if (cur !== undefined) {
            name = comps[i]; // Get the current component name.
            cur = cur[name]; // Try to access the child node.

            // If the child node is not found, stop traversal.
            if (cur === undefined) {
                break;
            }
        }
    }
    // Return the found node, its parent, and its name.
    return { node: cur, parent: previous, name: name };
}

//-----------------------------------------------------------------------------
// FUSE Handler: getattr
//-----------------------------------------------------------------------------

/*
 * This handler responds to the `getattr()` system call.
 * It provides file attributes (e.g., size, mode) for a given path.
 *
 * @param {string} path - The path to the file or directory.
 * @param {function(number, object)} cb - Callback function: `cb(err, stat)`.
 *                                        `err`: POSIX error code (0 for success).
 *                                        `stat`: A stat structure containing file information.
 */
function getattr(path, cb) {
    var stat = {}; // Initialize an empty stat object.
    var err = 0;   // Assume success initially (POSIX_OK).

    // Lookup the node in the JSON object.
    var info = lookup(obj, path);
    var node = info.node;

    // Determine attributes based on the type of the node.
    switch (typeof node) {
    case 'undefined':
        err = -2; // -ENOENT: No such file or directory.
        break;

    case 'object': // Represents a directory in our JSON FS.
        stat.size = 4096;   // Standard directory size.
        stat.mode = 0o040777; // Directory with rwxrwxrwx permissions.
        break;

    case 'string': // Represents a file (its content is a string).
        stat.size = node.length; // File size is the length of the string content.
        stat.mode = 0o0100666; // Regular file with rw-rw-rw- permissions.
        break;

    default:
        // For any other unexpected type, we might consider it an error
        // or a default file type, but for now, no specific action.
        break;
    }

    // Invoke the callback with the error code and stat structure.
    cb(err, stat);
}

//-----------------------------------------------------------------------------
// FUSE Handler: readdir
//-----------------------------------------------------------------------------

/*
 * This handler responds to the `readdir()` system call.
 * It provides a list of directory entries for a given path.
 *
 * @param {string} path - The path to the directory.
 * @param {function(number, string[])} cb - Callback function: `cb(err, names)`.
 *                                           `err`: POSIX error code (0 for success).
 *                                           `names`: An array of file/directory names within the specified path.
 */
function readdir(path, cb) {
    var names = []; // Array to store directory entry names.
    var err = 0;    // Assume success initially.

    // Locate the node corresponding to the path.
    var info = lookup(obj, path);

    // Handle different node types.
    switch (typeof info.node) {
    case 'undefined':
        err = -2; // -ENOENT: No such file or directory.
        break;

    case 'string': // Cannot read a file as a directory.
        err = -22; // -EINVAL: Invalid argument (not a directory).
        break;

    case 'object': // This node is a directory.
        var i = 0;
        // Iterate over the keys (property names) of the object, which are directory entries.
        for (key in info.node) {
            names[i++] = key;
        }
        break;

    default:
        // No action for other types.
        break;
    }

    // Call the callback with the result.
    cb(err, names);
}

//-----------------------------------------------------------------------------
// FUSE Handler: open
//-----------------------------------------------------------------------------

/*
 * This handler responds to the `open()` system call.
 * It's called when a file is opened.
 *
 * @param {string} path - The path to the file.
 * @param {number} flags - Requested access flags (e.g., O_RDONLY, O_WRONLY).
 * @param {function(number, [number])} cb - Callback function: `cb(err, [fh])`.
 *                                           `err`: POSIX error code (0 for success).
 *                                           `fh`: Optional numerical file handle.
 */
function open(path, flags, cb) {
    var err = 0; // Assume success.

    // Lookup the file node.
    var info = lookup(obj, path);

    // If the node doesn't exist, return an error.
    if (typeof info.node === 'undefined') {
        err = -2; // -ENOENT: No such file or directory.
    }
    // We don't return an explicit file handle, so fuse4js will assign 0.
    cb(err);
}

//-----------------------------------------------------------------------------
// FUSE Handler: read
//-----------------------------------------------------------------------------

/*
 * This handler responds to the `read()` system call.
 * It reads data from a file.
 *
 * @param {string} path - The path to the file.
 * @param {number} offset - The file offset to start reading from.
 * @param {number} len - The maximum number of bytes to read.
 * @param {Buffer} buf - The Buffer object to write the read data into.
 * @param {number} fh - The file handle (0 if not provided by `open`).
 * @param {function(number)} cb - Callback function: `cb(err)`.
 *                                 `err`: POSIX error code or number of bytes read (positive).
 */
function read(path, offset, len, buf, fh, cb) {
    var err = 0; // Assume success initially.

    // Find the file node.
    var info = lookup(obj, path);
    var file = info.node;
    var maxBytes;
    var data;

    // Handle different node types for reading.
    switch (typeof file) {
    case 'undefined':
        err = -2; // -ENOENT: File not found.
        break;

    case 'object': // Cannot read a directory as a file.
        err = -1; // -EPERM: Operation not permitted.
        break;

    case 'string': // Content is a string, treat as ASCII characters.
        if (offset < file.length) {
            maxBytes = file.length - offset; // Max bytes available from offset.
            if (len > maxBytes) {
                len = maxBytes; // Adjust length if trying to read past end of file.
            }
            // Extract the substring and write it to the buffer.
            data = file.substring(offset, offset + len); // Corrected substring end index.
            buf.write(data, 0, len, 'ascii');
            err = len; // Return the number of bytes actually read.
        } else {
            err = 0; // Read past end of file, return 0 bytes read.
        }
        break;

    default:
        // Default case, no specific error or action.
        break;
    }

    // Call the callback.
    cb(err);
}

//-----------------------------------------------------------------------------
// FUSE Handler: write
//-----------------------------------------------------------------------------

/*
 * This handler responds to the `write()` system call.
 * It writes data to a file.
 *
 * @param {string} path - The path to the file.
 * @param {number} offset - The file offset to start writing to.
 * @param {number} len - The number of bytes to write.
 * @param {Buffer} buf - The Buffer object containing data to write.
 * @param {number} fh - The file handle (0 if not provided by `open`).
 * @param {function(number)} cb - Callback function: `cb(err)`.
 *                                 `err`: POSIX error code or number of bytes written (positive).
 */
function write(path, offset, len, buf, fh, cb) {
    var err = 0; // Assume success.

    // Locate the file and its parent.
    var info = lookup(obj, path);
    var file = info.node;
    var name = info.name;
    var parent = info.parent;

    var beginning, blank = '', data, ending = '', numBlankChars;

    // Handle different node types for writing.
    switch (typeof file) {
    case 'undefined':
        err = -2; // -ENOENT: File not found.
        break;

    case 'object': // Cannot write to a directory.
        err = -1; // -EPERM: Operation not permitted.
        break;

    case 'string': // Content is a string; update it.
        // Convert the buffer data to a string.
        data = buf.toString('ascii', 0, len); // Read only `len` bytes from buf.

        if (offset < file.length) {
            // If writing within or overlapping existing content.
            beginning = file.substring(0, offset); // Part of the file before the write.
            if (offset + data.length < file.length) {
                // Keep the part of the file after the write if it's not fully overwritten.
                ending = file.substring(offset + data.length, file.length);
            }
        } else {
            // If writing beyond the current end of file, pad with spaces.
            beginning = file;
            numBlankChars = offset - file.length;
            while (numBlankChars--) {
                blank += ' ';
            }
        }

        // Update the file content in the parent object.
        // First delete, then re-assign (to ensure property order if needed, though JS objects don't guarantee this for numbers).
        delete parent[name];
        parent[name] = beginning + blank + data + ending;
        err = data.length; // Return the number of bytes written.
        break;

    default:
        // No specific action for other types.
        break;
    }

    // Call the callback.
    cb(err);
}

//-----------------------------------------------------------------------------
// FUSE Handler: release
//-----------------------------------------------------------------------------

/*
 * This handler responds to the `release()` system call.
 * It's called when a file is closed.
 *
 * @param {string} path - The path to the file.
 * @param {number} fh - The file handle.
 * @param {function(number)} cb - Callback function: `cb(err)`.
 *                                 `err`: POSIX error code (0 for success).
 */
function release(path, fh, cb) {
    // For this simple JSON FS, there are no resources to release.
    // Always return success.
    cb(0);
}

//-----------------------------------------------------------------------------
// FUSE Handler: create
//-----------------------------------------------------------------------------

/*
 * This handler responds to the `create()` system call.
 * It creates a new file.
 *
 * @param {string} path - The path of the new file to create.
 * @param {number} mode - The desired permissions (mode) for the new file.
 * @param {function(number, [number])} cb - Callback function: `cb(err, [fh])`.
 *                                           `err`: POSIX error code (0 for success).
 *                                           `fh`: Optional numerical file handle.
 */
function create(path, mode, cb) {
    var err = 0; // Assume success.

    // Lookup the potential location for the new file.
    var info = lookup(obj, path);

    switch (typeof info.node) {
    case 'undefined': // The file does not exist, which is good for creation.
        if (info.parent !== null) {
            // Create the new file as an empty string in its parent.
            info.parent[info.name] = '';
        } else {
            // If parent is null, it implies trying to create at root, which might be an error or not supported.
            // Or if path was like '/newfile' and 'obj' itself was null/undefined.
            err = -2; // -ENOENT: No such file or directory (parent doesn't exist).
        }
        break;

    case 'string': // File already exists.
    case 'object': // Directory already exists.
        err = -17; // -EEXIST: File exists.
        break;

    default:
        // No specific action for other types.
        break;
    }

    // Call the callback.
    cb(err);
}

//-----------------------------------------------------------------------------
// FUSE Handler: unlink
//-----------------------------------------------------------------------------

/*
 * This handler responds to the `unlink()` system call.
 * It deletes a file.
 *
 * @param {string} path - The path to the file to delete.
 * @param {function(number)} cb - Callback function: `cb(err)`.
 *                                 `err`: POSIX error code (0 for success).
 */
function unlink(path, cb) {
    var err = 0; // Assume success.

    // Locate the node to be unlinked.
    var info = lookup(obj, path);

    switch (typeof info.node) {
    case 'undefined':
        err = -2; // -ENOENT: No such file or directory.
        break;

    case 'object': // Cannot unlink a directory; use rmdir.
        err = -1; // -EPERM: Operation not permitted.
        break;

    case 'string': // This is a file, proceed with deletion.
        delete info.parent[info.name]; // Remove the property from its parent.
        break;

    default:
        // No action for other types.
        break;
    }

    // Call the callback.
    cb(err);
}

//-----------------------------------------------------------------------------
// FUSE Handler: rename
//-----------------------------------------------------------------------------

/*
 * This handler responds to the `rename()` system call.
 * It renames or moves a file or directory.
 *
 * @param {string} src - The current path of the file or directory.
 * @param {string} dst - The new path for the file or directory.
 * @param {function(number)} cb - Callback function: `cb(err)`.
 *                                 `err`: POSIX error code (0 for success).
 */
function rename(src, dst, cb) {
    var err = -2; // Assume failure (-ENOENT) initially.

    // Lookup the source node.
    var source = lookup(obj, src);
    var dest;

    if (typeof source.node !== 'undefined') { // If the source exists.
        // Lookup the destination path.
        dest = lookup(obj, dst);

        if (typeof dest.node === 'undefined' && dest.parent !== null) {
            // Destination does not exist and its parent is valid.
            // Move the source node to the destination.
            dest.parent[dest.name] = source.node;
            // Remove the source node from its original parent.
            delete source.parent[source.name];
            err = 0; // Success.
        } else {
            // Destination already exists or parent is invalid.
            err = -17; // -EEXIST: Destination already exists.
        }
    }
    // Call the callback.
    cb(err);
}

//-----------------------------------------------------------------------------
// FUSE Handler: mkdir
//-----------------------------------------------------------------------------

/*
 * This handler responds to the `mkdir()` system call.
 * It creates a new directory.
 *
 * @param {string} path - The path for the new directory.
 * @param {number} mode - The desired permissions (mode) for the new directory.
 * @param {function(number)} cb - Callback function: `cb(err)`.
 *                                 `err`: POSIX error code (0 for success).
 */
function mkdir(path, mode, cb) {
    var err = -2; // Assume failure (-ENOENT) initially.

    // Locate the destination for the new directory.
    var dst = lookup(obj, path);

    if (typeof dst.node === 'undefined' && dst.parent != null) {
        // If the destination does not exist and its parent is valid.
        dst.parent[dst.name] = {}; // Create an empty object as the new directory.
        err = 0; // Success.
    }
    // Call the callback.
    cb(err);
}

//-----------------------------------------------------------------------------
// FUSE Handler: rmdir
//-----------------------------------------------------------------------------

/*
 * This handler responds to the `rmdir()` system call.
 * It removes an empty directory.
 *
 * @param {string} path - The path to the directory to remove.
 * @param {function(number)} cb - Callback function: `cb(err)`.
 *                                 `err`: POSIX error code (0 for success).
 */
function rmdir(path, cb) {
    var err = -2; // Assume failure (-ENOENT) initially.

    // Locate the directory to be removed.
    var dst = lookup(obj, path);

    // Check if the node exists, is an object (directory), and has a parent.
    if (typeof dst.node === 'object' && dst.parent != null) {
        // For simplicity, we don't check if the directory is empty.
        // In a real FS, `rmdir` typically only works on empty directories.
        delete dst.parent[dst.name]; // Remove the directory from its parent.
        err = 0; // Success.
    }
    // Call the callback.
    cb(err);
}

//-----------------------------------------------------------------------------
// FUSE Handler: init
//-----------------------------------------------------------------------------

/*
 * This handler responds to the `init()` FUSE hook.
 * It is called when the file system is mounted. Use this for initialization tasks.
 *
 * @param {function()} cb - Callback function to call when initialization is complete.
 */
function init(cb) {
    console.log("JSON File system successfully started at mount point: " + options.mountPoint);
    console.log("To unmount, please use: fusermount -u " + options.mountPoint + " in another terminal.");
    // Call the callback to signal completion.
    cb();
}

//-----------------------------------------------------------------------------
// FUSE Handler: setxattr
//-----------------------------------------------------------------------------

/*
 * This handler responds to the `setxattr()` FUSE hook.
 * It sets extended attributes on a file or directory.
 * Note: The arguments can vary based on the operating system (e.g., macOS vs. Linux).
 *
 * @param {string} path - The path to the file or directory.
 * @param {string} name - The name of the extended attribute.
 * @param {Buffer} value - The value of the extended attribute.
 * @param {number} size - The size of the value.
 * @param {*} a - OS-dependent argument (position, flags).
 * @param {*} b - OS-dependent argument (options, cmd).
 * @param {*} c - OS-dependent argument (cmd, undefined).
 * @param {function(number)} cb - Callback function: `cb(err)`.
 */
function setxattr(path, name, value, size, a, b, c, cb) {
    console.log("Setxattr called with arguments:", path, name, value, size, a, b, c);
    // For this simple FS, we don't support extended attributes.
    // Return success but do nothing.
    cb(0);
}

//-----------------------------------------------------------------------------
// FUSE Handler: statfs
//-----------------------------------------------------------------------------

/*
 * This handler responds to the `statfs()` FUSE hook.
 * It provides file system statistics.
 *
 * @param {function(number, object)} cb - Callback function: `cb(err, stat)`.
 *                                         `err`: POSIX error code (0 for success).
 *                                         `stat`: A statvfs structure containing file system statistics.
 */
function statfs(cb) {
    // Return dummy statistics for a very large, generic file system.
    cb(0, {
        bsize: 1000000,   // Filesystem block size
        frsize: 1000000,  // Fragment size
        blocks: 1000000,  // Size of fs in 'frsize' units
        bfree: 1000000,   // Number of free blocks
        bavail: 1000000,  // Number of free blocks for unprivileged users
        files: 1000000,   // Number of inodes
        ffree: 1000000,   // Number of free inodes
        favail: 1000000,  // Number of free inodes for unprivileged users
        fsid: 1000000,    // Filesystem ID
        flag: 1000000,    // Mount flags
        namemax: 1000000  // Maximum filename length
    });
}

//-----------------------------------------------------------------------------
// FUSE Handler: destroy
//-----------------------------------------------------------------------------

/*
 * This handler responds to the `destroy()` FUSE hook.
 * It is called when the file system is unmounted. Use this for cleanup tasks.
 *
 * @param {function()} cb - Callback function to call when cleanup is complete.
 */
function destroy(cb) {
    // If an output JSON file is specified, write the (potentially modified)
    // JSON object back to the file.
    if (options.outJson) {
        try {
            // Stringify the object with 2-space indentation for readability.
            fs.writeFileSync(options.outJson, JSON.stringify(obj, null, '  '), 'utf8');
            console.log("Modified JSON data saved to: " + options.outJson);
        } catch (e) {
            console.error("Error writing JSON file during destroy: " + e);
        }
    }
    console.log("JSON File system stopped.");
    // Call the callback to signal completion.
    cb();
}

//-----------------------------------------------------------------------------
// FUSE Handler Mapping
//-----------------------------------------------------------------------------

// This object maps FUSE operation names to their corresponding handler functions.
var handlers = {
    getattr:  getattr,
    readdir:  readdir,
    open:     open,
    read:     read,
    write:    write,
    release:  release,
    create:   create,
    unlink:   unlink,
    rename:   rename,
    mkdir:    mkdir,
    rmdir:    rmdir,
    init:     init,
    destroy:  destroy,
    setxattr: setxattr,
    statfs:   statfs
};

//-----------------------------------------------------------------------------
// Command-line Usage Information
//-----------------------------------------------------------------------------

/**
 * @function usage
 * @description Prints the command-line usage instructions for running jsonFS.
 */
function usage() {
    console.log();
    console.log("Usage: node jsonFS.js [options] inputJsonFile mountPoint");
    console.log("  (Ensure the mount point directory is empty and you have write/execute permissions to it)");
    console.log();
    console.log("Options:");
    console.log("  -o outputJsonFile  : Save any modified data to a new JSON file.");
    console.log("                       The original input JSON file is never altered.");
    console.log("  -d                 : Enable FUSE debug statements (verbose output from FUSE library).");
    console.log("  -a                 : Add the 'allow_other' option to mount. This might require");
    console.log("                       'user_allow_other' to be enabled in your system's FUSE config file.");
    console.log();
    console.log("Example:");
    console.log("  node example/jsonFS.fs -d -o /tmp/output.json example/sample.json /tmp/mnt");
    console.log();
}

//-----------------------------------------------------------------------------
// Command-line Argument Parsing
//-----------------------------------------------------------------------------

/**
 * @function parseArgs
 * @description Parses command-line arguments to configure the file system.
 * @returns {boolean} `true` if arguments are parsed successfully, `false` otherwise.
 */
function parseArgs() {
    var i, remaining;
    var args = process.argv; // Get all command-line arguments.

    // Minimum arguments: node jsonFS.js inputJsonFile mountPoint (4 arguments including 'node' and 'jsonFS.js')
    if (args.length < 4) {
        return false; // Not enough arguments.
    }

    // The last two arguments are always the mount point and the input JSON file.
    options.mountPoint = args[args.length - 1];
    options.inJson = args[args.length - 2];

    // Calculate how many arguments are left to process as options.
    // Total args - 2 (node, jsonFS.js) - 2 (inJson, mountPoint) = total options.
    remaining = args.length - 4;
    i = 2; // Start checking from the third argument (index 2).

    // Loop through the remaining arguments (options).
    while (remaining--) {
        if (args[i] === '-d') {
            options.debugFuse = true; // Enable FUSE debugging.
            ++i; // Move to the next argument.
        } else if (args[i] === '-o') {
            if (remaining) { // Check if there's an argument after '-o'.
                options.outJson = args[i + 1]; // Get the output file path.
                i += 2; // Skip '-o' and its value.
                --remaining; // Account for the consumed value argument.
            } else {
                return false; // '-o' without a filename.
            }
        } else if (args[i] === '-a') {
            options.allowOthers = true; // Enable 'allow_other' mount option.
            ++i; // Move to the next argument.
        } else {
            return false; // Unknown or invalid option.
        }
    }
    return true; // Arguments parsed successfully.
}

//-----------------------------------------------------------------------------
// Main Execution Block
//-----------------------------------------------------------------------------

// Parse command-line arguments. If parsing fails, display usage and exit.
if (!parseArgs()) {
    usage();
    process.exit(1); // Exit with an error code.
}

// Try to read and parse the input JSON file.
try {
    var jsonString = fs.readFileSync(options.inJson, 'utf8');
    obj = JSON.parse(jsonString);
} catch (e) {
    console.error("Error reading or parsing input JSON file '" + options.inJson + "': " + e.message);
    process.exit(1); // Exit with an error code.
}

// Initialize and mount the FUSE file system.
// fuse4js.start() takes the mount point, the handler functions, and options.
f4js.start(options.mountPoint, handlers, options, function (err) {
    if (err) {
        console.error("FUSE filesystem failed to start: " + err);
        process.exit(1); // Exit with an error code.
    }
});

// The file system will now be active until unmounted or the process is stopped.