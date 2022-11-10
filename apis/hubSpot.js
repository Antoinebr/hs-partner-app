const axios = require("axios");

require('dotenv').config({
    path: '../variables.env'
});

const privateAppToken = process.env.privateAppToken;


const axiosConfig = {
    headers: {
        authorization: `Bearer ${privateAppToken}`
    }
};



/**
 * 
 * @param {string} email 
 * @returns {Promise}
 */
exports.getContactIdFromEmail = async (email) => {


    if (!email) throw new Error(`an email is required to search in the HubSpot portal`)

    if (typeof email !== "string") throw new Error(`Email has to be a string`)

    if (!privateAppToken) throw new Error(`There's not API key setup`);


    const endpoint = `https://api.hubapi.com/crm/v3/objects/contacts/search`;

    const searchResult = await axios.post(endpoint, {
        "filterGroups": [{
            "filters": [{
                "value": email,
                "propertyName": "email",
                "operator": "EQ"
            }]
        }]
    },axiosConfig);


    if (!searchResult.data && searchResult.data.results.length === -1) throw new Error(`Coulnd't find the contact`);


    return searchResult.data;


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
exports.updateContactByContactId = async (contactId, properties) => {

    if (!privateAppToken) throw new Error(`There's not privateAppToken setup`);

    const endpoint = `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`;

    return await axios.patch(endpoint, properties,axiosConfig);
}





