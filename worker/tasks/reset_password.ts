import { Task } from "graphile-worker";
import config from "../config";
import { SendEmailPayload } from "./send_email";

// TODO: spam prevention

interface SendResetPasswordPayload {
  email: string;
  knownUser: boolean;
  resetToken?: string;
}

export interface ResetPasswordVariables {
  resetLink?: string;
}

const isSendResetPasswordPayload = (
  payload: unknown
): payload is SendResetPasswordPayload => {
  const checkPayload = payload as SendResetPasswordPayload;
  return (
    checkPayload.email !== undefined && checkPayload.knownUser !== undefined
  );
};

const task: Task = async (payload, { addJob }) => {
  if (!isSendResetPasswordPayload(payload)) {
    console.warn("Absent email address or reset token: task payload ignored");
    return;
  }

  const encodedToken: string = encodeURIComponent(payload.resetToken as string);
  const variables: ResetPasswordVariables = {};
  if (payload.knownUser) {
    variables.resetLink = `${config.publicUrl}/account/confirmpasswordreset/${encodedToken}`;
  }

  const sendEmailPayload: SendEmailPayload = {
    options: {
      from: config.mailgunFromEmail,
      to: payload.email,
      subject: "Password reset requested",
    },
    templateName: payload.knownUser
      ? "reset_password.mjml"
      : "notify_reset_requested.mjml",
    variables,
  };
  await addJob("send_email", sendEmailPayload);
};

export default task;
