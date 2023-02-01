const { src, dest, parallel, series, watch } = require("gulp");
const clean = require("gulp-clean");
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer");
const rename = require("gulp-rename");
const sourcemaps = require("gulp-sourcemaps");
const cleanCSS = require("gulp-clean-css");
const browserSync = require("browser-sync").create();
const fileinclude = require("gulp-file-include");
const cssimport = require("gulp-cssimport");
const svgSprite = require("gulp-svg-sprite");
const ttf2woff2 = require("gulp-ttf2woff2");
const webpack = require("webpack");
const webpackStream = require("webpack-stream");
const notify = require("gulp-notify");
const uglify = require("gulp-uglify-es").default;
const plumber = require("gulp-plumber");
const htmlmin = require("gulp-htmlmin");
const size = require("gulp-size");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const newer = require("gulp-newer");
const del = require("del");
// const tinypng = require("gulp-tinypng-compress");

function delPublic() {
  // return src("./public", { read: false }).pipe(clean({ force: true }));
  return del("./public");
}

function fav() {
  return src("./src/*.ico, ./src/*webmanifest").pipe(dest("./public/"));
}

function htmlInclude() {
  return src("./src/pages/*.html")
    .pipe(
      plumber({
        errorHandler: notify.onError((error) => ({
          title: "HTML",
          message: error.message,
        })),
      })
    )
    .pipe(
      fileinclude({
        prefix: "@",
        basepath: "@file",
      })
    )
    .pipe(size({ title: "До сжатия" }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(size({ title: "После сжатия" }))
    .pipe(dest("./public"))
    .pipe(browserSync.stream());
}

function stylesCSS() {
  return src("./src/styles/style.css")
    .pipe(sourcemaps.init())
    .pipe(rename({ suffix: ".min" }))
    .pipe(cssimport())
    .pipe(autoprefixer({ cascade: false }))
    .pipe(size({ title: "До сжатия" }))
    .pipe(cleanCSS({ level: 2 }))
    .pipe(size({ title: "После сжатия" }))
    .pipe(sourcemaps.write("."))
    .pipe(dest("./public/styles"))
    .pipe(browserSync.stream());
}

// function stylesSCSS() {
//   return src("./src/styles/style.scss")
//     .pipe(sourcemaps.init())
//     .pipe(sass.sync().on("error", notify.onError()))
//     .pipe(rename({ suffix: ".min" }))
//     .pipe(autoprefixer({ cascade: false }))
//     .pipe(cleanCSS({ level: 2 }))
//     .pipe(sourcemaps.write("."))
//     .pipe(dest("./public/styles"))
//     .pipe(browserSync.stream());
// }

function imgToApp() {
  return (
    src(["./src/img/**/*.{jpg,jpeg,png}", "./src/img/*.svg"])
      // .pipe(tinypng({ key: "API_KEY" }))
      .pipe(imagemin({ verbose: true }))
      .pipe(dest("./public/img"))
  );
}

function imgWebp() {
  return src("./src/img/**/*.{jpg,jpeg,png}")
    .pipe(webp())
    .pipe(dest("./public/img"));
}

function svgSprites() {
  return (
    src("./src/img/svg/*.svg")
      // .pipe(tinypng({ key: "API_KEY" }))
      .pipe(imagemin({ verbose: true }))
      .pipe(svgSprite({ mode: { stack: { sprite: "../sprite.svg" } } }))
      .pipe(dest("./public/img"))
  );
}

function fonts() {
  return src("./src/fonts/**.ttf")
    .pipe(ttf2woff2())
    .pipe(dest("./public/fonts"));
}

function scripts() {
  return src("./src/js/main.js")
    .pipe(
      webpackStream({
        output: {
          filename: "main.js",
        },
        module: {
          rules: [
            {
              test: /\.m?js$/,
              exclude: /node_modules/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: [["@babel/preset-env", { targets: "defaults" }]],
                },
              },
            },
          ],
        },
      })
    )
    .pipe(sourcemaps.init())
    .pipe(uglify().on("error", notify.onError()))
    .pipe(sourcemaps.write("."))
    .pipe(dest("./public/js"))
    .pipe(browserSync.stream());
}

function watchFiles() {
  browserSync.init({
    server: {
      baseDir: "./public",
      // serveStaticOptions: {
      //   extensions: ['html'],
      // },
    },

    // port: 8080,
    // ui: { port: 8081 },
    // open: true,
  });

  // watch("./src/**/*.scss", styles);
  watch("./src/**/*.css", stylesCSS);
  watch(["./src/pages/*.html", "./src/components/**/*.html"], htmlInclude);
  watch("./src/img/**/*.jpg", imgToApp);
  watch("./src/img/**/*.png", imgToApp);
  watch("./src/img/**/*.jpeg", imgToApp);
  watch("./src/img/*.svg", imgToApp);
  watch("./src/img/**/*.{jpg,jpeg,png}", imgWebp);
  watch("./src/img/svg/*.svg", svgSprites);
  watch("./src/fonts/**.ttf", fonts);
  watch("./src/js/main.js", scripts);
}

exports.delPublic = delPublic;
exports.watchFiles = watchFiles;
// exports.stylesSCSS = stylesSCSS;
exports.stylesCSS = stylesCSS;
exports.htmlInclude = htmlInclude;
exports.scripts = scripts;

exports.default = series(
  delPublic,
  imgToApp,
  imgWebp,
  svgSprites,
  fonts,
  htmlInclude,
  scripts,
  // stylesSCSS,
  stylesCSS,
  watchFiles
);
