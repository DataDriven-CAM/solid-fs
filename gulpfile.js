var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

//script paths
var jsDest = './test/examples/js';

gulp.task('isomorphic-git-copy', function(done) {
    return gulp.src(['../isomorphic-git/*.js'])
        .pipe(gulp.dest(jsDest+'/isomorphic-git'));
});

gulp.task('solid-client-authn-js-copy', function(done) {
    return gulp.src(['../solid-client-authn-js/packages/browser/dist/**/*'])
        .pipe(gulp.dest(jsDest+'/solid-client-authn-browser'));
});

gulp.task('rdflib-copy', function(done) {
    return gulp.src(['./node_modules/rdflib/dist/**/*'])
        .pipe(gulp.dest(jsDest));
});

gulp.task('N3-copy', function(done) {
    return gulp.src(['./node_modules/N3.js/browser/n3.min.js'])
        .pipe(gulp.dest(jsDest));
});

gulp.task('solid-fs-copy', function(done) {
    return gulp.src(['./js/solid-fs.js'])
        .pipe(gulp.dest(jsDest));
});

gulp.task('default', gulp.series(gulp.parallel('isomorphic-git-copy',gulp.parallel('solid-client-authn-js-copy',gulp.parallel('rdflib-copy','N3-copy', 'solid-fs-copy'))), (done) => {
  // place code for your default task here
  done();
}));