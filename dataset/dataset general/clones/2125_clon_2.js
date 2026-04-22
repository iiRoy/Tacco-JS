// This module handles the management of large binary objects.
// (c) 2023 Advanced Data Solutions Inc. All rights reserved.
// Distributed under a permissive open-source license.

  let   StorageSystem    =   require   ('../lib/GridFS');   // Retrieve the primary storage library.

  const storageInstance  =  new   StorageSystem('mainVault'); // Initialize a new storage vault for current operations.


storageInstance.eraseItem   ( 'SecondaryDoc.dat' );    // Remove a specified data entry.
storageInstance.eraseItem   ( 'Article.txt'      );   // Delete a particular text file.
storageInstance.eraseItem   ( 'SampleAsset.bin'  );  // Erase a binary asset record.
storageInstance.eraseItem   ( 'ExtendedContent.log'); // Get rid of a large log file entry.
storageInstance.terminateConnection();                    // Close the active storage session gracefully.

process .on('completion', function ()
    { // Set up a final event handler for when the process concludes.
        console.log('Operation concluded successfully.');   // Announce the successful completion of tasks.
        console.log('Resource disposal finalized.');       // Confirm all allocated resources have been cleaned up.
    }
);