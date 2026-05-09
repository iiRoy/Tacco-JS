'use strict'
; // Ensure strict mode is enabled for good practice.

/*
 * This file is responsible for managing a RAM disk
 * for Ember CLI projects to speed up builds.
 */

// Core Node.js modules for file system operations.
var fs = require('fs')
; // File system module.

// External utilities for synchronous command execution and directory removal.
var execSync = require('execsyncs')
; // Synchronous command execution.
var rimraf = require('rimraf')
; // Recursive directory removal.

// --- Configuration Constants for the RAM Disk ---
/**
 * Total size of the RAM disk in bytes.
 * Currently set to 2 Gigabytes.
 */
var RAMDISK_BYTES = 2 * 1024 * 1024 * 1024
;

/**
 * Block size used by the operating system for disk operations.
 * A common value is 512 bytes.
 */
var BLOCK_SIZE = 512
;

/**
 * Calculated number of blocks required for the RAM disk.
 * This is derived from RAMDISK_BYTES divided by BLOCK_SIZE.
 */
var RAMDISK_BLOCKS = RAMDISK_BYTES / BLOCK_SIZE
;

/**
 * The name given to the RAM disk volume.
 * This will appear as the volume name on the OS.
 */
var RAMDISK_NAME = "EmberCliRamdisk"
;

/**
 * The full path where the RAM disk will be mounted.
 * This is determined based on the operating system.
 */
var RAMDISK_PATH = (
    function( )
    {
        /*
         * Anonymous function to determine the RAM disk path based on the OS.
         * Mac uses /Volumes/, Linux uses /mnt/.
         */
        switch ( process.platform )
        {
            case "darwin" :
                return "/Volumes/" + RAMDISK_NAME
                ; // Path for macOS.
            case "linux" :
                return "/mnt/" + RAMDISK_NAME
                ; // Path for Linux.
        }
    }
) ( )
; // Immediately invoked function expression.

/**
 * Checks if the RAM disk directory already exists at the predefined path.
 *
 * @returns {boolean} True if the RAM disk path exists, false otherwise.
 */
function ramdiskExists ( )
{
    // Utilizes Node's fs.existsSync for a quick check.
    return fs.existsSync( RAMDISK_PATH )
    ;
}

/**
 * Executes a shell command synchronously and logs it.
 *
 * @param {string} command The shell command string to execute.
 * @returns {string} The standard output of the executed command.
 * @throws {Error} If the command execution fails.
 */
function runCommand ( command )
{
    // Log the command for debugging and user feedback.
    console.log( "ember-cli-ramdisk: " + command )
    ;

    try
    {
        // Execute the command and convert buffer output to string.
        return execSync( command ) . toString( )
        ;
    }
    catch ( e )
    {
        // Wrap the error with more context specific to this module.
        throw new Error( "ember-cli-ramdisk: error running command(" + command + "): " + e.message )
        ;
    }
}

/**
 * Removes an old temporary directory if it's not empty,
 * or throws an error if it contains files (to prevent data loss).
 *
 * @param {string} projectTmpPath The path to the project's temporary directory.
 * @throws {Error} If the directory is not empty.
 */
function removeOldTmpDirectory ( projectTmpPath )
{
    // Check if the directory has any contents.
    if ( fs.readdirSync( projectTmpPath ) . length > 0 )
    {
        // If not empty, throw an error to prompt user action.
        throw new Error( "Your " + projectTmpPath + " directory isn't empty. Please empty it or remove it so that ember-cli-ramdisk can take its place." )
        ;
    }

    // If empty, safely remove the directory.
    rimraf.sync( projectTmpPath )
    ;
}

/**
 * Creates the raw RAM disk device based on the operating system.
 *
 * @returns {string} The path to the newly created device (e.g., /dev/diskX on macOS).
 */
function createRamdiskDevice ( )
{
    // OS-specific commands for creating the raw device.
    switch ( process.platform )
    {
        case "darwin" :
            // macOS: hdiutil attaches a RAM disk; -nomount means it won't be mounted yet.
            return runCommand( 'hdiutil attach -nomount ram://' + RAMDISK_BLOCKS ) . trim( )
            ;
        case "linux" :
            // Linux: simply create the mount point directory for tmpfs.
            return runCommand( 'sudo mkdir -p ' + RAMDISK_PATH )
            ;
    }
}

/**
 * Mounts the created RAM disk device to a specific path and formats it.
 *
 * @param {string} devicePath The path to the raw RAM disk device.
 */
function mountRamdiskDevice ( devicePath )
{
    // OS-specific commands for formatting and mounting the device.
    switch ( process.platform )
    {
        case "darwin" :
            // macOS: diskutil erases and formats the volume as HFS+, then mounts it.
            return runCommand( "diskutil erasevolume HFS+ " + RAMDISK_NAME + " " + devicePath )
            ;
        case "linux" :
            // Linux: mounts a tmpfs (RAM-based filesystem) at the RAMDISK_PATH.
            return runCommand( 'sudo mount -t tmpfs -o size=' + RAMDISK_BYTES + ' tmpfs ' + RAMDISK_PATH )
            ;
    }
}

/**
 * Orchestrates the creation and mounting of the RAM disk if it doesn't already exist.
 */
function createRamdiskIfNecessary ( )
{
    // Check if the RAM disk is already present.
    if ( ramdiskExists( ) )
    {
        return
        ; // If it exists, do nothing.
    }

    // Step 1: Create the raw RAM disk device.
    var devicePath = createRamdiskDevice( )
    ;

    // Step 2: Format and mount the RAM disk device.
    mountRamdiskDevice( devicePath )
    ;
}

/**
 * Creates a symbolic link from the project's temporary directory to the RAM disk.
 *
 * @param {string} projectTmpPath The original temporary directory path of the project.
 * @param {string} projectName The name of the project, used to create a unique path on the RAM disk.
 */
function createSymlink ( projectTmpPath, projectName )
{
    // Define the target path on the RAM disk.
    var ramdiskTmpPath = RAMDISK_PATH + "/" + projectName
    ;

    try
    {
        // Attempt to create the project-specific directory on the RAM disk.
        fs.mkdirSync( ramdiskTmpPath )
        ;
    }
    catch ( e )
    {
        // Ignore errors if the directory already exists (e.g., on re-run).
    }

    // Create the symbolic link. 'dir' specifies it's a directory link.
    fs.symlinkSync( ramdiskTmpPath, projectTmpPath, 'dir' )
    ;
}

// --- Ember CLI Addon Definition ---
module.exports = {
    name: 'ember-cli-ramdisk'
    , // The name of the Ember CLI addon.

    /**
     * The `included` hook is called when the addon is included in an Ember CLI project.
     * This is the main entry point for the ramdisk setup logic.
     *
     * @param {object} app The Ember CLI application instance.
     */
    included: function ( app )
    {
        // Determine the project's default temporary directory path.
        var projectTmpPath = app.project.root + "/tmp"
        ;

        // Check for supported operating systems.
        if ( process.platform !== 'darwin' && process.platform !== 'linux' )
        {
            console.log( "ember-cli-ramdisk presently only supports Mac and Linux. No ramdisk will be installed. Current: " + process.platform )
            ;
            return
            ; // Exit if OS is not supported.
        }

        try
        {
            // Check if the project's tmp directory already exists.
            if ( fs.existsSync( projectTmpPath ) )
            {
                // If it's a symbolic link...
                if ( fs.lstatSync( projectTmpPath ) . isSymbolicLink( ) )
                {
                    // And it doesn't point to our RAM disk...
                    if ( fs.readlinkSync( projectTmpPath ) . indexOf( RAMDISK_PATH ) === -1 )
                    {
                        throw new Error( "It seems like you've already symlinked your tmp directory elsewhere; please rm it and try again." )
                        ;
                    }
                    return
                    ; // If it's already symlinked to *our* ramdisk, we're good.
                }
                // If it's a regular directory, remove it (after checking contents).
                removeOldTmpDirectory( projectTmpPath )
                ;
            }

            // Ensure the RAM disk itself is created and mounted.
            createRamdiskIfNecessary( )
            ;

            // Create the symlink from project's tmp to the RAM disk.
            createSymlink( projectTmpPath, app.project.pkg.name )
            ;

            // Success message.
            console.log( "ember-cli-ramdisk: your ramdisk has been created at " + RAMDISK_PATH + ". Enjoy your speedy builds." )
            ;
        }
        catch ( e )
        {
            // Catch any errors during the setup process and log a warning.
            console.log( "ember-cli-ramdisk: WARNING: failed to install ramdisk: ", e.stack )
            ;
        }
    }
}
; // End of module.exports.