module.exports = {
  mode: "production",
  entry: {
    main: ["./dist/index.js"]
  },
  output: {
    filename: "lang-checker.js",
    path: __dirname + "/bundle",
    library: "langChecker",
    libraryTarget: "var"
  },
}