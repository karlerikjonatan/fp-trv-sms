const {
  COMPARE_DATE,
  SOCIAL_SECURITY_NUMBER,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_SMS_FROM,
  TWILIO_SMS_TO,
} = process.env;

const RESOLVE_200 = {
  statusCode: 200,
  body: "200 OK",
};

const RESOLVE_500 = {
  statusCode: 500,
  body: "500 INTERNAL SERVER ERROR",
};

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

const fetch = require("node-fetch");
const twilio = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

exports.handler = async () => {
  return new Promise((resolve, _) => {
    fetch("https://fp.trafikverket.se/boka/occasion-bundles", {
      body,
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        resolve(RESOLVE_500);
      })
      .then(({ data }) => {
        if (COMPARE_DATE < data?.bundles[0]?.occasions[0]?.date) {
          return data?.bundles[0]?.occasions[0]?.date;
        }
        resolve(RESOLVE_200);
      })
      .then(async (date) => {
        const message = await twilio.messages.create({
          body: date,
          from: TWILIO_SMS_FROM,
          to: TWILIO_SMS_TO,
        });
        return message;
      })
      .then(() => resolve(RESOLVE_200))
      .catch(() => resolve(RESOLVE_500));
  });
};
