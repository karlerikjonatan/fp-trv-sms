const {
  COMPARE_DATE,
  SOCIAL_SECURITY_NUMBER,
  TRAFIKVERKET_API_ENDPOINT,
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
    bookingModeId: 0,
    examinationTypeId: 0,
    excludeExaminationCategories: [],
    ignoreBookingHindrance: false,
    ignoreDebt: false,
    licenceId: 5,
    paymentIsActive: false,
    paymentReference: null,
    paymentUrl: null,
    rescheduleTypeId: 0,
    searchedMonths: 0,
    socialSecurityNumber: SOCIAL_SECURITY_NUMBER,
  },
  occasionBundleQuery: {
    examinationTypeId: 12,
    languageId: 0,
    // Linköping
    locationId: 1000009,
    // Motala, Mjölby, Tranås
    nearbyLocationIds: [1000012, 1000011, 1000077],
    occasionChoiceId: 1,
    searchedMonths: 0,
    startDate: "1970-01-01T00:00:00.000Z",
    tachographTypeId: 1,
    vehicleTypeId: 4,
  },
});

const fetch = require("node-fetch");
const twilio = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

exports.handler = async () => {
  return new Promise((resolve, _) => {
    fetch(TRAFIKVERKET_API_ENDPOINT, {
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
        if (COMPARE_DATE > data?.bundles[0]?.occasions[0]?.date) {
          return `${data?.bundles[0]?.occasions[0]?.date} ${data?.bundles[0]?.occasions[0]?.locationName}`;
        }
        resolve(RESOLVE_200);
      })
      .then(async (body) => {
        const message = await twilio.messages.create({
          body,
          from: TWILIO_SMS_FROM,
          to: TWILIO_SMS_TO,
        });
        return message;
      })
      .then(() => resolve(RESOLVE_200))
      .catch(() => resolve(RESOLVE_500));
  });
};
