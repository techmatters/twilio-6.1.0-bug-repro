import twilio from "twilio";
import { loadEnvFile } from "node:process";

loadEnvFile();

const uniqueName = "some-test-doc";
export const main = async () => {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );

  try {
    const cleanDoc = await client.sync.v1
      .services("IS7ef5d818076de1d6b5dec0d7ce5ff310")
      .documents(uniqueName)
      .remove();
    console.log(">>>>>>>>> cleanDoc", cleanDoc);
  } catch (err) {
    console.log(">>>>>>>>> does not exists, skipping cleanup");
  }
  const syncdoc = await client.sync.v1
    .services("IS7ef5d818076de1d6b5dec0d7ce5ff310")
    .documents.create({
      data: {},
      ttl: 60,
      uniqueName,
    });
  console.log(">>>>>>>>> syncdoc", syncdoc);

  const updated = await syncdoc.update({
    data: { some: "thing" },
  });
  console.log(">>>>>>>>> updated", updated);

  const deleted = await updated.remove();
  console.log(">>>>>>>>> deleted", deleted);
};

main();
