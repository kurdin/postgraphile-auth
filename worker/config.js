"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.getConfig = function () {
    var config = {
        isProduction: process.env.NODE_ENV === "production",
        mailgunApiKey: process.env.MAILGUN_API_KEY,
        mailgunDomain: process.env.MAILGUN_DOMAIN,
        mailgunFromEmail: process.env.MAILGUN_FROM_EMAIL,
        mailgunFromTitle: process.env.MAILGUN_FROM_TITLE,
        publicUrl: process.env.PUBLIC_URL,
    };
    for (var _i = 0, _a = Object.entries(config); _i < _a.length; _i++) {
        var _b = _a[_i], k = _b[0], v = _b[1];
        if (v === undefined) {
            throw new Error(k + " must be defined.");
        }
    }
    return config;
};
exports.default = exports.getConfig();
//# sourceMappingURL=config.js.map