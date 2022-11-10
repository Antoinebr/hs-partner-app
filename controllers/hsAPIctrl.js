const axios = require("axios");

require('dotenv').config({
    path: '../variables.env'
});

const apiKey = process.env.HAPIKEY;


/**
 * 
 * @param {string} email 
 * @returns {Promise}
 */
exports.getContactIdFromEmail = async (email) => {

    if (!email) throw new Error(`an email is required to search in the HubSpot portal`)

    if (typeof email !== "string") throw new Error(`Email has to be a string`)

    if (!apiKey) throw new Error(`There's not API key setup`);


    const endpoint = `https://api.hubapi.com/crm/v3/objects/contacts/search?hapikey=${apiKey} `;

    return axios.post(endpoint, {
        "filterGroups": [{
            "filters": [{
                "value": email,
                "propertyName": "email",
                "operator": "EQ"
            }]
        }]
    });


}






/*
curl --request PATCH \
  --url 'https://api.hubapi.com/crm/v3/objects/contacts/?hapikey=YOUR_HUBSPOT_API_KEY' \
  --header 'content-type: application/json' \
  --data '{
  "properties": {
    "company": "Biglytics",
    "email": "bcooper@biglytics.net",
    "firstname": "Bryan",
    "lastname": "Cooper",
    "phone": "(877) 929-0687",
    "website": "biglytics.net"
  }
}'
*/
exports.updateContactByContactId = (contactId, properties) => {

    if (!apiKey) throw new Error(`There's not API key setup`);

    const endpoint = `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}?hapikey=${apiKey}`;


    console.log(properties);
    return axios.patch(endpoint, properties);
}