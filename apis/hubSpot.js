const axios = require("axios");
const Users = require('../models/Users');

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
    }, axiosConfig);


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

    return await axios.patch(endpoint, properties, axiosConfig);
}



/**
 * Goal : Keep HubSpot data and this app in sync
 * How I'm gonna use this feature : When a new version of this app is deployed, it will : 
 * 
 */
exports.syncTheDBwithHubspot = async () => {

    // Get All the contacts from the DB 

    const allContacts = await Users.getUsers();

    const contactUpdated = [];

    // Loop all the contacts 
    for (const contact of allContacts) {

        // Find the contact ID in HubSpot from the email
        const hubSpotContact = await this.getContactIdFromEmail(contact.email);

        // test if the contact exists in HubSpot otherwise don't do anything
        if (hubSpotContact.total === 1) {

            const { id, properties } = hubSpotContact.results[0];

            // @todo check if properties are differents from what we already have in the DB

            const res = await this.updateContactByContactId(id, {
                "properties": {
                    carmanufacturer: contact.carManufacturer,
                    car_model: contact.carModel,
                    tokens_available: contact.tokensAvailable,
                }
            }).catch(error => console.error(error));

            contactUpdated.push(res.data);
        
        }


    }

    return contactUpdated;

}