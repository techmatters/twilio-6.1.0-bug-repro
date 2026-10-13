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
      .services(process.env.TWILIO_SYNC_SERVICE_SID)
      .documents(uniqueName)
      .remove();
    console.log(">>>>>>>>> cleanDoc", cleanDoc);
  } catch (err) {
    console.log(">>>>>>>>> does not exists, skipping cleanup");
  }
  const syncdoc = await client.sync.v1
    .services(process.env.TWILIO_SYNC_SERVICE_SID)
    .documents.create({
      data: {},
      ttl: 60,
      uniqueName,
    });
  console.log(">>>>>>>>> syncdoc", syncdoc);

  const updated1 = await client.sync.v1
    .services(process.env.TWILIO_SYNC_SERVICE_SID)
    .documents(uniqueName)
    .update({ data: { some: "thing" } });
  console.log(">>>>>>>>> updated1", updated1);

  const updated2 = await syncdoc.update({
    data: { some: "another thing" },
  });
  console.log(">>>>>>>>> updated2", updated2);

  const deleted = await updated2.remove();
  console.log(">>>>>>>>> deleted", deleted);
};

main();
