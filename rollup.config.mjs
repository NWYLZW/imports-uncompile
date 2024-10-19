import { dts } from 'rollup-plugin-dts'
import nodeResolve from '@rollup/plugin-node-resolve'

export default /** @type {import('rollup').RollupOptions} */ ({
  input: 'src/index.ts',
  output: {
    dir: 'dist'
  },
  plugins: [
    nodeResolve(),
    dts({
      respectExternal: true,
      tsconfig: 'tsconfig.json'
    })
  ]
})
