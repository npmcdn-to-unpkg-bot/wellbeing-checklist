var gulp = require('gulp');

gulp.task('deploy', function() {

  gulp.src('./build/*.js')
    .pipe(gulp.dest('./dist/build/'));

  gulp.src('index.html')
    .pipe(gulp.dest('./dist/'));

  gulp.src('./js/*.js')
    .pipe(gulp.dest('./dist/js/'));

});
