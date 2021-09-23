import { codeFrameColumns } from '@babel/code-frame';
import { readFileSync } from 'fs';
import 'colors';

export class PrettifiedError {
    err: Error;
    constructor(err: Error) {
        this.err = err;
        let linecontent = err.stack.split("\n")[1];
        let index = linecontent.indexOf('at ');
        let clean = linecontent.slice(index + 3, linecontent.length);
        let line = clean.match(/\:[0-9](.*?)\:/g)[0].replace(/\:/g, '');
        let column: any = clean.match(/\:(?:.(?!\:))+$/gim)[0].replace(/(\:|\))/g, '');
        let ssf = clean.match(/(\/|.:\\)(.*?):[0-9]/gim); // (\/|.:\\) -> match unix/nt paths (/etc | C:\etc)

        let filepath = ssf[0].replace('(', '')
        filepath = filepath.substr(0, filepath.length - 2)
        let filecontent = readFileSync(filepath);
        let frame = codeFrameColumns(filecontent.toString(), { start: { line: Number(line), column: Number(column) } }, {
            linesAbove: 4,
            linesBelow: 4,
            highlightCode: true,
        })
        this.displayError(frame, filepath)
    }

    displayError(frame: string, filepath) {
        let errorHeader = `${this.err.name.red}: ${this.err.message}`.replace(/^/gm, ' '.repeat(2))
        let relativeFilePath = filepath.replace(process.cwd(), '').replace(/(\\|\/)/, './').replace(/\\/g, '/');
        console.log(`ERROR in ${relativeFilePath}`.red)

        console.log(errorHeader)
        console.log(
            frame.replace(/^/gm, ' '.repeat(4))
        )
        console.log(
            this.err.stack.split('\n').splice(2, this.err.stack.split('\n').length).join('\n')
        )
    }
}

process.on('uncaughtException', (e: Error) => new PrettifiedError(e))
process.on('unhandledRejection', (e: Error) => new PrettifiedError(e))