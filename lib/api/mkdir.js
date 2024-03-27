var SMB2Forge = require('../tools/smb2-forge');
var SMB2Request = SMB2Forge.request;

/*
 * mkdir
 * =====
 *
 * create folder:
 *
 *  - create the folder
 *
 *  - close the folder
 *
 */
module.exports = function mkdir(path, mode, cb) {
  if (typeof mode === 'function') {
    cb = mode;
    mode = '0777';
  }

  var connection = this;

  // Function to create a single directory
  function createDirectory(path, callback) {
    // SMB2 open file
    SMB2Request('create_folder', { path: path }, connection, function (err, file) {
      if (err) {
        callback(err);
      } else {
        // SMB2 query directory
        SMB2Request('close', file, connection, function () {
          callback(null);
        });
      }
    });
  }

  // Recursive function to create nested folders
  function mkdirRecursive(pathArray, index, basePath, callback) {
    if (index >= pathArray.length) {
      // Base case: All directories created
      callback(null);
      return;
    }

    var currentPath = basePath + '/' + pathArray[index];

    createDirectory(currentPath, function (err) {
      if (err) {
        callback(err);
      } else {
        mkdirRecursive(pathArray, index + 1, currentPath, callback);
      }
    });
  }

  // Split the path into an array of folder names
  var folders = path.split('/').filter(function (folder) {
    return folder !== '';
  });

  // Start creating nested folders recursively
  mkdirRecursive(folders, 0, '', cb);
};
