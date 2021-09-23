import 'colors';
export declare class PrettifiedError {
    err: Error;
    constructor(err: Error);
    displayError(frame: string, filepath: any): void;
}
