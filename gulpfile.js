var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

//script paths
var jsDest = './test/examples/js';

gulp.task('isomorphic-git-copy', function(done) {
    return gulp.src(['../isomorphic-git/dist/bundle*.*'])
        .pipe(gulp.dest(jsDest));
});

gulp.task('solid-auth-client-copy', function(done) {
    return gulp.src(['../solid-auth-client/dist-lib/**/*'])
        .pipe(gulp.dest(jsDest));
});

gulp.task('rdflib-copy', function(done) {
    return gulp.src(['../rdflib.js/dist/**/*'])
        .pipe(gulp.dest(jsDest));
});

gulp.task('N3-copy', function(done) {
    return gulp.src(['../N3.js/N3.bundle.js'])
        .pipe(gulp.dest(jsDest));
});

gulp.task('default', gulp.series(gulp.parallel('isomorphic-git-copy',gulp.parallel('solid-auth-client-copy',gulp.parallel('rdflib-copy','N3-copy'))), (done) => {
  // place code for your default task here
  done();
}));