/**
 * AppError
 * An error that carries an HTTP status code.
 * Services throw it ("not found", "already answered" ...) and the central
 * error handler in app.js turns it into a clean JSON response.
 */
export class AppError extends Error {
    constructor(status, message, code) {
        super(message);
        this.status = status;
        this.code = code;
    }
}
