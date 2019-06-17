module.exports = {
  mode: "production",
  entry: {
    main: ["./src/index.js"]
  },
  output: {
    filename: "lang-checker.js",
    path: __dirname + "/dist",
    library: "langChecker",
    libraryTarget: "var"
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      }
    ]
  }
}