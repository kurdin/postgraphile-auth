import { renderFile } from "eta";
import { Task } from "graphile-worker";
import mjml2html from "mjml";
import path from "path";
import { mailer } from "../email";
import { ConfirmEmailVariables } from "./confirm_email";
import { ResetPasswordVariables } from "./reset_password";

mailer.init();

export interface SendEmailPayload {
  options: {
    from: string;
    to: string | string[];
    subject: string;
  };
  templateName: string;
  variables: ConfirmEmailVariables | ResetPasswordVariables;
}

const isSendEmailPayload = (payload: unknown): payload is SendEmailPayload =>
  (payload as SendEmailPayload).options?.to !== undefined;

const task: Task = async (payload) => {
  if (!isSendEmailPayload(payload)) {
    throw Error("Not an email payload.");
  }

  const { options, templateName, variables } = payload;
  if (!templateName) {
    throw Error("No template provided.");
  }
  const templatePath = path.join(__dirname, "..", "templates", templateName);

  try {
    const { errors, html } = mjml2html(
      await renderFile(templatePath, variables)
    );

    if (errors.length) {
      throw Error("Email template failed to compile.");
    }

    const result = await mailer.send(options.to, options.subject, html);
    console.log("MAIL RESULT:", result);
  } catch (e) {
    console.error(`Worker failed to send email: ${e.message}`);
  }
};

export default task;
