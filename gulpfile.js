const gulp = require('gulp');
const fs = require('fs');
const babel = require('gulp-babel');
const watch = require('gulp-watch');
const run = require('gulp-run-command');
var exec = require('child_process').exec;
var path = require('path')
var merge = require('merge-stream');


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

        merge(
            gulp.src("test/**/*.js").pipe(gulp.dest('dist/test/')),
            gulp.src("config/*.json").pipe(gulp.dest('dist/config/')),
            gulp.src("contracts/**/*.sol").pipe(gulp.dest('dist/contracts/')),
            gulp.src('src/*buffle/**/*.js')
                .pipe(babel({
                    presets: ['es2015']
                }))
                .pipe(gulp.dest('dist'))
                .pipe(execmd)
        )

		
    } catch (e) {
      // console.log("run error"+e);
    }
}

gulp.task('build',()=> 
        merge(
            gulp.src("test/**/*.js").pipe(gulp.dest('dist/test/')),
            gulp.src("config/*.json").pipe(gulp.dest('dist/config/')),
            gulp.src("contracts/**/*.sol").pipe(gulp.dest('dist/contracts/')),
            gulp.src('src/*buffle/**/*.js')
                .pipe(babel({
                    presets: ['es2015']
                }))
                .pipe(gulp.dest('dist'))
               
        )
    
     );


gulp.task('default',function () {
    // Callback mode, useful if any plugin in the pipeline depends on the `end`/`flush` event
    buildAndRun();
    return watch(['src/*buffle/**/*.js','test/**/*.js'], buildAndRun);
});
