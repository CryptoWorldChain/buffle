var HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')


const path = require('path');
// console.log("path=="+path+"===>"+path.resolve(__dirname, "keystore"))
module.exports = {
	mode: "development",
  	entry: './src/buffle/index.js',
	optimization: {
	    //minimizer: [
	    //  new TerserPlugin({ /* your config */ })
	    // ]
	},
	devtool: 'inline-source-map',

	devServer: {
	    contentBase: path.join(__dirname, 'dist'),
	    compress: true,
	    port: 9000
	 },
 	module: {
	    rules: [
	      {//load keystore
	        test: /\.(json)$/,
	        include:[path.resolve(__dirname, "keystore")],
	       	loader: 'json-loader',
            options: {
            	outputPath:'keystore'
            }
	      },
	      {
	        test: /\.(png|jpg|gif|proto)$/,
	       	loader: 'file-loader',
	       	include:[path.resolve(__dirname, "src/cwv/proto")],
            options: {
            	outputPath:'pbs'
            }
	      },
	      
	    ],
	 },
	resolve: {//import的时候不需要加上js
   		 extensions: ['.wasm', '.mjs', '.js', '.json'],
   		 alias:{
   		 	Keystore: path.resolve(__dirname, 'keystore'),
   		 }
  	},
  	output: {
    	filename: 'buffle.js',
    	path: path.resolve(__dirname, 'dist'),
    	library:'buffle',
    	libraryTarget:'commonjs',
    	libraryExport:'default'
  	},
  	node: {
		    console: 'mock',
		    fs: 'empty',
		    net: 'empty',
		    tls: 'empty'
		},
	

  	plugins: [new HtmlWebpackPlugin(),


		// new CopyWebpackPlugin([
		// 	{
		// 	  from: "keystore/",
		// 	  to: 'keystore',
		// 	  test: /([^/]+)\/(.+)\.json$/,
		// 	  ignore:['.DS_Store']
		// 	}
		// ],{}),



  	],

};
