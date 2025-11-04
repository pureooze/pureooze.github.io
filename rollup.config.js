import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/js/resume.js', // your app’s entry point
  output: {
    file: '_site/js/resume.js', // where Eleventy serves from
    format: 'esm',              // use 'iife' for older browsers
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    terser()
  ]
};
