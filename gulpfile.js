"use strict";

const gulp = require("gulp");   // la base
const plumber = require("gulp-plumber"); // prevent gulp"s pipe breaking
const browser_sync = require("browser-sync").create(); // upload les fichiers au browser sans avoir à recharger la page
const sass = require("gulp-dart-sass");  // génération de css à partir de scss
const rename = require("gulp-rename");
const cssnano = require("cssnano"); // minify css
const postcss = require("gulp-postcss"); // rétro-compatibilité de css pour vieux navigateur
const autoprefixer = require("autoprefixer"); // ajoute les règles css de chaque navigateur (-webkit-gradient, -webkit-transition, etc...)
const uglify = require("gulp-uglify"); // minify js
const nodemon = require("gulp-nodemon");

const OUTPOUT_DIR = "./public_html/";

function browserSync(done) {
    browser_sync.init({
		open: false,
        proxy: "localhost:8000",
    });
    done();
}

function startNodemon() {
	
	// to avoid nodemon being started multiple times
	var started = false;
	watch();
	
	return nodemon({
		script: 'server.js',
	}).on('start', function () {
		if (!started) {
			started = true;
		}
	});
}

function cssImports() {
    return gulp
        .src(["./scss/**/*.scss", "!./scss/themes.scss"])
        .pipe(plumber())
        .pipe(rename({ suffix: ".min" }))
        .pipe(sass({ outputStyle: "expanded" }))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(gulp.dest(OUTPOUT_DIR))
        .pipe(browser_sync.stream());
}

function css() {
    return gulp
        .src(["./scss/stillshit.scss"])
        .pipe(plumber())
        .pipe(rename({ suffix: ".min" }))
        .pipe(sass({ outputStyle: "expanded" }))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(gulp.dest(OUTPOUT_DIR))
        .pipe(browser_sync.stream());
}

function js() {
    return gulp
        .src(["./frontend.js"])
        .pipe(plumber())
        .pipe(rename({ suffix: ".min" }))
        .pipe(uglify({mangle:{toplevel: true}}))
        .pipe(gulp.dest(OUTPOUT_DIR))
        .pipe(browser_sync.stream());
}

function watchFiles() {
    gulp.watch("./scss/**/*.scss", css);
    gulp.watch("./frontend.js", js);
}

const install = gulp.series(cssImports, js);
const watch = gulp.parallel(watchFiles, browserSync);

exports.css = css;
exports.js = js;
exports.install = install;
exports.start = startNodemon;