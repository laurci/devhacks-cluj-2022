/* eslint-disable */

const path = require("path");

module.exports = {
    mode: "development",
    entry: "./src/index.tsx",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        fallback: {
            "path": require.resolve("path-browserify"),
            "stream": require.resolve("stream-browserify")
        }
    },
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "build"),
    },
    devServer: {
        proxy: {
            '/api': {
                target: 'http://localhost:4001',
                pathRewrite: { "^/api": "" }
            },
            '/socket.io': {
                target: 'http://localhost:4001',
                ws: true
            }
        }
    }
};
