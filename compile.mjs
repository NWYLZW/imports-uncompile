import { resolve } from 'node:path'

import ts from 'typescript'

const { config } = ts.readConfigFile(resolve('./tsconfig.json'), ts.sys.readFile)
const { options } = ts.parseJsonConfigFileContent(config, ts.sys, resolve('./'))

const program = ts.createProgram([resolve('./src/index.ts')], options)

console.log(
  'src/internal.ts is from external library:',
  program.isSourceFileFromExternalLibrary(program.getSourceFile('src/internal.ts'))
)
let expectWriteFile = false
program.emit(
  program.getSourceFile('src/internal.ts'),
  (fileName, text) => {
    expectWriteFile = true
  },
  undefined,
  true
)
if (!expectWriteFile) {
  console.warn('Expected write file to be called')
} else {
  console.log('write file was called')
}

const useImportsSelfAsProgramRoot = ts.createProgram([resolve('./src/internal.ts')], options)
useImportsSelfAsProgramRoot.emit(
  useImportsSelfAsProgramRoot.getSourceFile('src/internal.ts'),
  (fileName, text) => {
    expectWriteFile = true
  },
  undefined,
  true
)
if (!expectWriteFile) {
  console.warn('Expected write file to be called')
} else {
  console.log('write file was called')
}
