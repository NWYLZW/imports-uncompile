# Recurrent `imports` uncompile error

当我尝试使用 `imports` 规则来导入一个模块时，我发现它会导致一个错误。在这里你可以使用 `pnpm run build` 来编译这个项目，然后你会看到这个错误：

```text
src/index.ts → dist...
[!] RollupError: src/internal.ts (1:7): Expected '{', got 'type' (Note that you need plugins to import files that are not JavaScript)
src/internal.ts (1:7)
1: export type Internal = 'internal'
          ^
2: export const internal = 'internal'
```

这个错误实际的原因是 rollup-plugin-dts 插件在编译 dts 文件时没有处理 `imports` 导致的，我们需要让该插件去处理对应的 imports 引入。

## 原因调查

这里我们可以运行 `pnpm run compile` 模拟编译过程并且观察对应的输出，你可以看到：

```text
src/internal.ts is from external library: true
Expected write file to be called
write file was called
```

点击[文件](./compile.mjs)查看脚本具体内容。

[emit](https://github.com/microsoft/TypeScript/blob/df9d16503f6755dd071e4c591b9d21c39d03d95e/src/compiler/program.ts#L2857)
-> [emitWorker](https://github.com/microsoft/TypeScript/blob/df9d16503f6755dd071e4c591b9d21c39d03d95e/src/compiler/program.ts#L2868-L2877)
-> [emitFiles](https://github.com/microsoft/TypeScript/blob/df9d16503f6755dd071e4c591b9d21c39d03d95e/src/compiler/emitter.ts#L763)
-> [getSourceFilesToEmit](https://github.com/microsoft/TypeScript/blob/df9d16503f6755dd071e4c591b9d21c39d03d95e/src/compiler/utilities.ts#L6540)
-> [sourceFileMayBeEmitted](https://github.com/microsoft/TypeScript/blob/df9d16503f6755dd071e4c591b9d21c39d03d95e/src/compiler/utilities.ts#L6557)

经过如上调用堆栈，我们可以发现发现之所以没有输出便是因为 program 将 `src/internal.ts` 视为外部依赖，这导致这个文件没有任何的编译信息输出。

https://github.com/Swatinem/rollup-plugin-dts/blob/39f45994fa9656803ef716dbd185522104d66565/src/index.ts#L44-L52

在上面这段代码可以发现，编译的时候插件实际上复用了相关的 program，而当我们需要编译 `src/internal.ts` 文件时，实际上使用的是以 `src/index.ts` 作为根的 program。
