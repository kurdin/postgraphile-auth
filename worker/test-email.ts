import { mailer } from "./email";

mailer.init();

(async () => {
  try {
    const result = await mailer.send("rich.churcher@gmail.com", "Yup.", "Yup.");
    console.log("MAIL:", result);
  } catch (e) {
    console.error("Nope:", e);
  }
})();
