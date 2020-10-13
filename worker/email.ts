import { NodeMailgun } from "ts-mailgun";
import config from "./config";

export const mailer = new NodeMailgun();
mailer.apiKey = config.mailgunApiKey;
mailer.domain = config.mailgunDomain;
mailer.fromEmail = config.mailgunFromEmail;
mailer.fromTitle = config.mailgunFromTitle;
