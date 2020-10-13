import { Task } from "graphile-worker";
import config from "../config";
import { SendEmailPayload } from "./send_email";

// TODO: spam prevention

interface SendConfirmEmailPayload {
  email: string;
  confirmToken: string;
}

export interface ConfirmEmailVariables {
  confirmLink: string;
}

const isSendConfirmEmailPayload = (
  payload: unknown
): payload is SendConfirmEmailPayload => {
  const checkPayload = payload as SendConfirmEmailPayload;
  return (
    checkPayload.email !== undefined && checkPayload.confirmToken !== undefined
  );
};

const task: Task = async (payload, { addJob }) => {
  if (!isSendConfirmEmailPayload(payload)) {
    console.warn("Absent email address or confirm token: task payload ignored");
    return;
  }

  const confirmLink = `${
    config.publicUrl
  }/account/confirmemail/${encodeURIComponent(payload.confirmToken)}`;
  const sendEmailPayload: SendEmailPayload = {
    options: {
      from: config.mailgunFromEmail,
      to: payload.email,
      subject: "Please confirm your email address",
    },
    templateName: "confirm_email.mjml",
    variables: {
      confirmLink,
    },
  };
  await addJob("send_email", sendEmailPayload);
};

export default task;
