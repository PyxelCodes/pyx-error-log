"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrettifiedError = void 0;
var code_frame_1 = require("@babel/code-frame");
var fs_1 = require("fs");
require("colors");
var PrettifiedError = /** @class */ (function () {
    function PrettifiedError(err) {
        this.err = err;
        var linecontent = err.stack.split("\n")[1];
        var index = linecontent.indexOf('at ');
        var clean = linecontent.slice(index + 3, linecontent.length);
        var line = clean.match(/\:[0-9](.*?)\:/g)[0].replace(/\:/g, '');
        var column = clean.match(/\:(?:.(?!\:))+$/gim)[0].replace(/(\:|\))/g, '');
        var ssf = clean.match(/(\/|.:\\)(.*?):[0-9]/gim); // (\/|.:\\) -> match unix/nt paths (/etc | C:\etc)
        var filepath = ssf[0].replace('(', '');
        filepath = filepath.substr(0, filepath.length - 2);
        var filecontent = (0, fs_1.readFileSync)(filepath);
        var frame = (0, code_frame_1.codeFrameColumns)(filecontent.toString(), { start: { line: Number(line), column: Number(column) } }, {
            linesAbove: 4,
            linesBelow: 4,
            highlightCode: true,
        });
        this.displayError(frame, filepath);
    }
    PrettifiedError.prototype.displayError = function (frame, filepath) {
        var errorHeader = (this.err.name.red + ": " + this.err.message).replace(/^/gm, ' '.repeat(2));
        var relativeFilePath = filepath.replace(process.cwd(), '').replace(/(\\|\/)/, './').replace(/\\/g, '/');
        console.log(("ERROR in " + relativeFilePath).red);
        console.log(errorHeader);
        console.log(frame.replace(/^/gm, ' '.repeat(4)));
        console.log(this.err.stack.split('\n').splice(2, this.err.stack.split('\n').length).join('\n'));
    };
    return PrettifiedError;
}());
exports.PrettifiedError = PrettifiedError;
process.on('uncaughtException', function (e) { return new PrettifiedError(e); });
process.on('unhandledRejection', function (e) { return new PrettifiedError(e); });
