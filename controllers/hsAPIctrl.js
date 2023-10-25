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



/**
 * Update a contact in HubSpot CRM by contact ID.
 *
 * @param {string} contactId - The ID of the contact to be updated.
 * @param {Object} properties - An object containing the properties to be updated for the contact.
 * @returns {Promise} - A promise that resolves with the result of the update operation.
 * @throws {Error} - If no API key is set up.
 */
exports.updateContactByContactId = (contactId, properties) => {

    if (!apiKey) throw new Error(`There's not API key setup`);

    const endpoint = `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}?hapikey=${apiKey}`;


    console.log(properties);
    return axios.patch(endpoint, properties);
}
