require("dotenv-flow").config();

const {
  COMPARE_DATE,
  SOCIAL_SECURITY_NUMBER,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_SMS_FROM,
  TWILIO_SMS_TO,
} = process.env;

let headers = new Headers();
headers.append("Content-Type", "application/json");

const body = JSON.stringify({
  bookingSession: {
    socialSecurityNumber: SOCIAL_SECURITY_NUMBER,
    licenceId: 5,
    bookingModeId: 0,
    ignoreDebt: false,
    ignoreBookingHindrance: false,
    examinationTypeId: 0,
    excludeExaminationCategories: [],
    rescheduleTypeId: 0,
    paymentIsActive: false,
    paymentReference: null,
    paymentUrl: null,
    searchedMonths: 0,
  },
  occasionBundleQuery: {
    startDate: "1970-01-01T00:00:00.000Z",
    searchedMonths: 0,
    locationId: 1000019,
    nearbyLocationIds: [],
    vehicleTypeId: 2,
    tachographTypeId: 1,
    occasionChoiceId: 1,
    examinationTypeId: 12,
  },
});

const options = {
  body,
  headers,
  method: "POST",
};

const fetch = require("node-fetch");
const twilio = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

exports.handler = async (event, context) => {
  try {
    fetch("https://fp.trafikverket.se/boka/occasion-bundles", options)
      .then((response) => response.json())
      .then(({ data }) => {
        const earliestDateAvailable = data?.bundles[0]?.occasions[0]?.date;
        if (COMPARE_DATE > earliestDateAvailable) {
          twilio.messages.create({
            body: earliestDateAvailable,
            from: TWILIO_SMS_FROM,
            to: TWILIO_SMS_TO,
          });
        }
      });
  } catch (error) {
    return {
      statusCode: 500,
      body: "500 Internal Server Error",
    };
  }

  return {
    statusCode: 200,
    body: "200 OK",
  };
};
