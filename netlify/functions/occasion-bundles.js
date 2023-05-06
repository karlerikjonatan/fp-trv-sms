const fetch = require("node-fetch");
const twilio = require("twilio");

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_SMS_FROM,
  TWILIO_SMS_TO,
} = process.env;

const END_DATE = "2022-05-28";
const REQUEST_PAYLOAD = require("./payload.json");
const REQUEST_URL = "https://fp.trafikverket.se/boka/occasion-bundles";

exports.handler = async () => {
  try {
    const response = await fetch(REQUEST_URL, {
      body: JSON.stringify(REQUEST_PAYLOAD),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${REQUEST_URL}`);
    }

    const { data } = await response.json();
    const { date, locationName, time } = data?.bundles[0]?.occasions[0] || {};

    if (END_DATE > date) {
      await twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN).messages.create({
        body: `${date} ${time} ${locationName}`,
        from: TWILIO_SMS_FROM,
        to: TWILIO_SMS_TO,
      });
    }

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};
