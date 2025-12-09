const gulp = require('gulp');
const path = require('path');

function buildIcons() {
	return gulp
		.src('nodes/**/icons/*.{png,svg}')
		.pipe(gulp.dest('dist/nodes'));
}

exports['build:icons'] = buildIcons;
exports.default = buildIcons;
