const { src, dest, series, watch, parallel } = require("gulp")
const del = require("del")
const livereload = require("gulp-livereload")

function clean() {
  return del("./dist")
}

function copyScripts() {
  return src("./scripts/**/*.js").pipe(dest("./dist/scripts/"))
}

function copyManifest() {
  return src("./manifest.json").pipe(dest("./dist/"))
}

function reload() {
  livereload.listen()
  watch("./scripts/**/*.js", series(clean, copy))
}

exports.clean = clean
const copy = parallel(copyScripts, copyManifest)
exports.default = reload
