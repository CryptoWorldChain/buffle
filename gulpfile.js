const gulp = require('gulp');
const fs = require('fs');
const babel = require('gulp-babel');
const watch = require('gulp-watch');
const run = require('gulp-run-command');
var exec = require('child_process').exec;
var path = require('path')

require('log-timestamp');

var buildAndRun =  () =>
{
	try {
		console.log("gulp [start build] ......>>>>>>")
		var execmd=exec('node dist/buffle/index.js ',{stdio:'inherit'});
        // execmd.stdout.on('data', function(data) {
        //     // console.log(data); 
        //    
        // });
         execmd.stdout.pipe(process.stdout);
         execmd.stderr.pipe(process.stdout);
         execmd.on('exit', function (code) {
            console.log("gulp [end run]");
         })

        execmd.write=(chunk, encoding, cb) => {
			// console.log("exec write:"+JSON.stringify(chunk)+",cb="+cb);
			return true;
		}
        execmd.end=()=>{
            return true;
        }
        gulp.src("test/**/*.js").pipe(gulp.dest('dist/test/'));
        gulp.src("contracts/**/*.sol").pipe(gulp.dest('dist/contracts/'));
	    gulp.src('src/*buffle/**/*.js')
	        .pipe(babel({
	            presets: ['es2015']
	        }))
	        .pipe(gulp.dest('dist'))
        	.pipe(execmd)
    } catch (e) {
      // console.log("run error"+e);
    }
}

gulp.task('build',()=> {
        gulp.src('src/*buffle/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist'));
        gulp.src("test/**/*.js").pipe(gulp.dest('dist/test/'))
        gulp.src("contracts/**/*.solc").pipe(gulp.dest('dist/contracts/'));
        }
     );


gulp.task('default',function () {
    // Callback mode, useful if any plugin in the pipeline depends on the `end`/`flush` event
    buildAndRun();
    return watch(['src/*buffle/**/*.js','test/**/*.js'], buildAndRun);
});
