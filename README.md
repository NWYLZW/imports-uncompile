# Recurrent `imports` uncompile error

When I try to use the `imports` rule to import a module, I find that it causes an error. Here you can use `pnpm run build` to compile this project, and then you will see this error:

```text
src/index.ts → dist...
[!] RollupError: src/internal.ts (1:7): Expected '{', got 'type' (Note that you need plugins to import files that are not JavaScript)
src/internal.ts (1:7)
1: export type Internal = 'internal'
          ^
2: export const internal = 'internal'
```

The actual reason for this error is that the rollup-plugin-dts plugin does not handle imports when compiling dts files. We need to let the plugin handle the corresponding imports.  

## Cause investigation

Here we can run pnpm run compile to simulate the compilation process and observe the corresponding output. You can see:

```text
src/internal.ts is from external library: true
Expected write file to be called
write file was called
```

Click [file](./compile.mjs) to view the script details.

[emit](https://github.com/microsoft/TypeScript/blob/df9d16503f6755dd071e4c591b9d21c39d03d95e/src/compiler/program.ts#L2857)
-> [emitWorker](https://github.com/microsoft/TypeScript/blob/df9d16503f6755dd071e4c591b9d21c39d03d95e/src/compiler/program.ts#L2868-L2877)
-> [emitFiles](https://github.com/microsoft/TypeScript/blob/df9d16503f6755dd071e4c591b9d21c39d03d95e/src/compiler/emitter.ts#L763)
-> [getSourceFilesToEmit](https://github.com/microsoft/TypeScript/blob/df9d16503f6755dd071e4c591b9d21c39d03d95e/src/compiler/utilities.ts#L6540)
-> [sourceFileMayBeEmitted](https://github.com/microsoft/TypeScript/blob/df9d16503f6755dd071e4c591b9d21c39d03d95e/src/compiler/utilities.ts#L6557)


Through the above call stack, we can find that the reason for no output is that the program treats `src/internal.ts` as an external dependency, which results in no compilation information being output for this file.

https://github.com/Swatinem/rollup-plugin-dts/blob/39f45994fa9656803ef716dbd185522104d66565/src/index.ts#L44-L52

In the above code, it can be found that the plugin actually reuses the related program during compilation, and when we need to compile the `src/internal.ts` file, it actually uses the program with `src/index.ts` as the root.
