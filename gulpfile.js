const gulp = require( 'gulp' );
const uglify = require( 'gulp-uglify' );
const babel = require( 'gulp-babel' );
const rename = require( 'gulp-rename' );
const removeComments = require( 'gulp-strip-comments' );
const cleanCSS = require( 'gulp-clean-css' );
const minifyHTML = require( 'gulp-htmlmin' );
const removeHTMLComments = require( 'gulp-remove-html-comments' );
const PROD_FOLDER = 'build';

function components() {
  return gulp.src( 'src/components/menus/*.xml' )
  .pipe( removeComments() )
  .pipe( gulp.dest( `${ PROD_FOLDER }/components/menus` ) );
}

function data() {
  return gulp.src( 'src/data/*.json' )
  .pipe( removeComments() )
  .pipe( gulp.dest( `${ PROD_FOLDER }/data` ) );
}

function html() {
  return gulp.src( 'src/*.html' )
  .pipe( removeHTMLComments() )
  .pipe( minifyHTML({
    collapseWhitespace: true
  }))
  .pipe( gulp.dest( PROD_FOLDER ) );
}

function scripts() {
  return gulp.src( 'src/scripts/*.js' )
  .pipe( removeComments() )
  .pipe( gulp.dest( `${ PROD_FOLDER }/scripts` ) );
}

function styles() {
  return gulp.src( 'src/styles/*.css' )
  .pipe( cleanCSS() )
  .pipe( gulp.dest( `${ PROD_FOLDER }/styles` ) );
}

function views() {
  return gulp.src( 'src/views/*.xml' )
  .pipe( removeComments() )
  .pipe( gulp.dest( `${ PROD_FOLDER }/views` ) );
}

gulp.task( 'build', gulp.series( components, data, html, scripts, styles, views ) );
gulp.task( 'a', html );