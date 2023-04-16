const path = require("path");

module.exports = {
  target: "node",
  externals: { express: "require('express')" },
  mode: "development",
  entry: "./server.js",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "server.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
};
