const {dest, src, watch, series} = require('gulp');
const browserSync = require('browser-sync');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify-es').default;
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const changed = require('gulp-changed');
const htmlreplace = require('gulp-html-replace');
const htmlmin = require('gulp-htmlmin');
const clean = require('gulp-dest-clean');
const inlinesource = require('gulp-inline-source');
var merge = require('merge-stream');

const config = {
    dist: 'app/dist/',
    src: 'app/src/',
    cssin: 'app/src/css/**/*.css',
    jsin: 'app/src/js/includes/**/*.js',
    imgin: 'app/src/img/**/*.{jpg,jpeg,png,gif}',
    htmlin: 'app/src/*.html',
    scssin: 'app/src/scss/**/*.scss',
    cssout: 'app/dist/css/',
    jsinout: 'app/src/js/*.js',
    jsout: 'app/dist/js/',
    jsappout: 'app/src/js',
    imgout: 'app/dist/img/',
    htmlout: 'app/dist/',
    scssout: 'app/src/css/',
    cssoutname: 'style.css',
    jsoutname: 'script.js',
    cssreplaceout: 'style.min.css',
    jsreplaceout: 'script.min.js',
    cssreplaceoutpath: 'css/style.min.css',
    jsreplaceoutpath: 'js/script.min.js',
    htmlInlineOut: 'app/inline',
    cssInlineOut: 'app/inline/css',
    jsInlineOut: 'app/inline/js'
};


function reload(done){
	browserSync.reload();
	done();
};

function style(){
	return src(config.scssin)
	.pipe(sourcemaps.init())
	.pipe(sass().on('error', sass.logError))
	.pipe(autoprefixer({
		browsers: ['last 3 versions'],
		cascade: false
	}))
	.pipe(sourcemaps.write())
	.pipe(dest(config.scssout))
	.pipe(browserSync.stream())
};

function script(done) {
    return src(config.jsin)
    .pipe(concat(config.jsoutname))
    .pipe(dest(config.jsappout))
    .pipe(browserSync.stream())
    done();
};

function inline(){

	let inlineCss = src(config.cssin)
	.pipe(dest(config.cssInlineOut));

	let inlineJS = src(config.jsinout)
	.pipe(dest(config.jsInlineOut));

	let inlineHtml = src(config.htmlin)
	.pipe(inlinesource())
	.pipe(dest(config.htmlInlineOut));

	return merge(inlineCss, inlineJS, inlineHtml);
};

function minify_css(){
	return src(config.cssin)
	.pipe(concat(config.cssreplaceout))
	.pipe(cleanCSS())
	.pipe(dest(config.cssout));
};

function minify_js(done){
	return src(config.jsinout)
	.pipe(concat(config.jsreplaceout))
	.pipe(uglify())
	.pipe(dest(config.jsout));
	done();
};

function opt_img(){
	return src(config.imgin)
	.pipe(clean(config.imgout))
	.pipe(changed(config.imgout))
	.pipe(imagemin())
	.pipe(dest(config.imgout))
};

function html_replace_src(){
	return src(config.htmlin)
	.pipe(htmlreplace({
		'css': config.cssreplaceoutpath,
		'js': config.jsreplaceoutpath
	}))
	.pipe(htmlmin({
		sortAttributes: true,
		sortClassName: true,
		collapseWhitespace: true
	}))
	.pipe(dest(config.htmlout))
};

function serve(){
	browserSync({
		server: 'app/src'
	});
	watch(config.htmlin, series(reload, html_replace_src));
	watch(config.scssin, series(style, minify_css));
	watch(config.jsin, series(script, minify_js));
	watch(config.imgin, opt_img);
};

exports.default = serve;
exports.inline = inline;