"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailer = void 0;
var ts_mailgun_1 = require("ts-mailgun");
var config_1 = __importDefault(require("./config"));
exports.mailer = new ts_mailgun_1.NodeMailgun();
exports.mailer.apiKey = config_1.default.mailgunApiKey;
exports.mailer.domain = config_1.default.mailgunDomain;
exports.mailer.fromEmail = config_1.default.mailgunFromEmail;
exports.mailer.fromTitle = config_1.default.mailgunFromTitle;
//# sourceMappingURL=email.js.map