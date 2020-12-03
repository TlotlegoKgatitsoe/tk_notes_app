const express = require( 'express' );
const app = express();
const path = require( 'path' );
const PORT = process.env.PORT || 3215;
const fs = require( 'fs' );

if ( process.env.NODE_ENV === 'development' ) require( 'dotenv' ).config();
const SRC_URL = path.join( __dirname, process.env.APP_FOLDER );

// Middleware
app.use( express.static( SRC_URL ) );

// Send the html file
app.get( '/', ( req, res ) => {
  res.sendFile( path.join( SRC_URL, 'index.html' ) );
});

// Allows the app to get dialog data
app.get( '/data/dialog/:name', ( req, res ) => {
  fs.readFile( `${ SRC_URL }/data/${ req.params.name }.json`, ( err, data ) => {
    res.send( data.toString() );
  });
});

// Allows the app to get specific components
app.get( '/view/:name', ( req, res ) => {
  fs.readFile( `${ SRC_URL }/views/${ req.params.name }.xml`, ( err, data ) => {
    res.send( data.toString() );
  });
});

// Listen for the app
app.listen( PORT, () => {
  console.log( `app is listening on port ${ PORT }` );
});