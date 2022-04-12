const path = require('path');
const slsw = require("serverless-webpack");
const WebpackSourceMapSupport = require("webpack-source-map-support");

/**
 * Using webpack - Has issue with deasync
 * If you aren't using AWS Secrets Manager 
 *    - don't need to do anything
 * If yu are using AWS Secrets Manager
 *    - need to get the deasync.node bindings to your lambda.  There are 2 ways
 *       1)  Use deasync in the sdk and copy node modules
 *          - Copy the `node_modules/leo-sdk/node_modules/deasync` to `node_modules/deasync`
 *              const CopyPlugin = require("copy-webpack-plugin");
 *              plugins: [new CopyPlugin({
 *                patterns: [{ from: "node_modules/leo-sdk/node_modules/deasync", to: "node_modules/deasync" }],
 *              })]
 *          - Add `deasync` to externals
 *              externals:["aws-sdk", "deasync"]
 *       2) Use custom wrapper of deasync (Current)
 *          - Add file-loader
 *              rules: [{
 *                loader: "file-loader",
 *                test: /\.node$/
 *              }
 */

//const CopyPlugin = require("copy-webpack-plugin"); // Options 1

module.exports = (async () => {
  return {
    entry: slsw.lib.entries,
    externals: [
      "aws-sdk",
      //"deasync" // Options 1
    ],
    devtool: slsw.lib.webpack.isLocal
      ? 'eval-cheap-module-source-map'
      : 'source-map',
    //devtool: "source-map",
    mode: slsw.lib.webpack.isLocal ? "development" : "production",
    // plugins: [new WebpackSourceMapSupport()],
    // Options 1
    // plugins: [new CopyPlugin({
    //   patterns: [
    //     { from: path.dirname(require.resolve("deasync")), to: "node_modules/deasync" },
    //   ],
    // }),],

    module: {
      rules: [
        // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
        {
          exclude: [
            [
              path.resolve(__dirname, ".serverless"),
              path.resolve(__dirname, ".webpack"),
            ],
          ],
          loader: "ts-loader",
          options: {
            experimentalWatchApi: true,
            transpileOnly: true,
          },
          test: /\.(tsx?)$/,
        },

        // Options 2
        // {
        //   loader: "file-loader",
        //   test: /\.node$/
        // }
      ],
    },
    optimization: {
      minimize: false, // We do not want to minimize our code. Easier to fix in lambda console.
    },
    output: {
      filename: "[name].js",
      // sourceMapFilename: "[file].map",
      libraryTarget: "commonjs",
      path: path.join(__dirname, ".webpack"),
      // devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]'
      // devtoolModuleFilenameTemplate: '[absolute-resource-path]'
    },
    resolve: {
      cacheWithContext: false,
      extensions: [".mjs", ".json", ".ts", ".js"],
      symlinks: false,
    },
    target: "node",
  };
})();
