const {series, watch, src, dest, parallel} = require('gulp');
const pump = require('pump');
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const zip = require('gulp-zip');
const beeper = require('beeper');

const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

function handleError(done) {
    return function (err) {
        if (err) {
            beeper();
        }
        return done(err);
    };
}

function css(done) {
    const processors = [
        autoprefixer(),
        cssnano()
    ];

    pump([
        src('assets/css/**/*.css', {sourcemaps: true}),
        concat('screen.css'),
        postcss(processors),
        dest('assets/built/', {sourcemaps: '.'}),
    ], handleError(done));
}

function zipper(done) {
    const filename = require('./package.json').name + '.zip';

    pump([
        src([
            '**',
            '!node_modules', '!node_modules/**',
            '!dist', '!dist/**',
            '!assets/css', '!assets/css/**'
        ]),
        zip(filename),
        dest('dist/')
    ], handleError(done));
}

function watcher() {
    watch('assets/css/**/*.css', css);
}

const build = series(css);
const dev = series(build, watcher);

exports.build = build;
exports.zip = series(build, zipper);
exports.default = dev;