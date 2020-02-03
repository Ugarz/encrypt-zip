// require modules
var fs = require( 'fs' );
var archiver = require( 'archiver' );
var generator = require('generate-password');


var password = generator.generate({
  length: 10,
  numbers: true,
});
console.log(password);

archiver.registerFormat('zip-encryptable', require('archiver-zip-encryptable'));


// create a file to stream archive data to.
var output = fs.createWriteStream( __dirname + '/output/donnees.zip' );


var archive = archiver('zip-encryptable', {
  zlib: { level: 9 },
  forceLocalTime: true,
  encryptionMethod: 'aes256',
  password,
});

// listen for all archive data to be written
// 'close' event is fired only when a file descriptor is involved
output.on( 'close', function () {
  console.log( archive.pointer() + ' total bytes' );
  console.log( 'archiver has been finalized and the output file descriptor has closed.' );
} );

// This event is fired when the data source is drained no matter what was the data source.
// It is not part of this library but rather from the NodeJS Stream API.
// @see: https://nodejs.org/api/stream.html#stream_event_end
output.on( 'end', function () {
  console.log( 'Data has been drained' );
} );

// good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on( 'warning', function ( err ) {
  if ( err.code === 'ENOENT' ) {
    // log warning
  } else {
    // throw error
    throw err;
  }
} );

// good practice to catch this error explicitly
archive.on( 'error', function ( err ) {
  throw err;
} );

// pipe archive data to the file
archive.pipe( output );

// append a file from stream
var file1 = __dirname + '/toZip/hey.txt';
archive.append( fs.createReadStream( file1 ), { name: 'file1.txt' } );


// finalize the archive (ie we are done appending files but streams have to finish yet)
// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
archive.finalize();