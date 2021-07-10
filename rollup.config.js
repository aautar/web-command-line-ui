import babel from 'rollup-plugin-babel';

const babelConfig = {
  babelrc: false,
  presets: [
    [
      '@babel/env', 
      {
        targets: {
          "chrome": "41"
        },       
        "corejs": "2",
        useBuiltIns: "usage"     
      }
    ],          
    ['minify', {
      builtIns: false,
      deadcode: false,
    }], 
  ],
  comments: false,
  exclude: 'node_modules/**',
};

// rollup.config.js
export default [
  {
    input: 'src/Shell.mjs',
    output: {
      format: 'iife',
      file: 'dist/web-command-line-ui.iife.js',
      name: 'WebCommandLineUI'
    }
  },
  {
    input: 'src/Shell.mjs',
    output: {
      format: 'iife',
      file: 'dist/web-command-line-ui.iife.min.js',
      name: 'WebCommandLineUI',
      sourcemap: true  
    },
    plugins: [
      babel(babelConfig),
    ],        
  }
];
