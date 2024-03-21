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
 * Handles errors thrown by axios requests and logs relevant information.
 *
 * @param {Error} error - The error object thrown by axios.
 */
/**
 * Handles errors thrown by axios requests and logs relevant information.
 *
 * @param {Error} error - The error object thrown by axios.
 */
const axiosErrorHandler = error => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser 
        // and an instance of http.ClientRequest in node.js
        console.log(error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
    }
}




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



exports.updateContactByContactId = async (contactId, properties) => {

    if (!privateAppToken) throw new Error(`There's not privateAppToken setup`);

    const endpoint = `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`;

    return await axios.patch(endpoint, properties, axiosConfig);
}


exports.associateDealWithContact = async (dealId, toObjectID) => {

    const endpoint = "https://api.hubapi.com/crm/v3/associations/deals/contacts/batch/create";

    return await axios.post(endpoint, {
        "inputs": [{
            "from": {
                "id": dealId
            },
            "to": {
                "id": toObjectID
            },
            "type": "deal_to_contact"
        }]
    }, axiosConfig);
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


exports.syncTestWithHubSpot = async () => {

    // carey85@gmail.com
}

exports.getAllTickets = async () => {


    const response = await axios.post('https://api.hubspot.com/crm/v3/objects/tickets/search', {
        filterGroups: [{
            filters: [{
                propertyName: 'hs_ticket_requester_email',
                operator: 'EQ',
                value: 'abrossault@hubspot.com'
            }]
        }],
        "properties": [
            "name"
        ],
    }, axiosConfig).catch(console.log)

    // Le tableau de tickets en statut "open" pour le contact spécifié se trouve dans response.data.results
    const openTickets = response.data.results;

    return openTickets;

}



exports.addContact = async (properties) => {

    if (!privateAppToken) throw new Error(`There's not privateAppToken setup`);

    const endpoint = `https://api.hubapi.com/crm/v3/objects/contacts`;

    console.log("🔥 addContact")

    return await axios.post(endpoint, properties, axiosConfig);
};


exports.getAllConversations = async () => {

    const apiUrl = `https://api.hubapi.com/conversations/v3/conversations/threads`;

    const response = await axios.get(apiUrl, {
        headers: {
            authorization: `Bearer ${process.env.privateAppTokenPartner}`
        }
    }).catch(console.log);

    return response.data;

}

exports.displayAllTickets = async () => {

    const apiUrl = `https://api.hubapi.com/crm/v3/objects/tickets?limit=100&archived=false`;

    const response = await axios.get(apiUrl, {
        headers: {
            authorization: `Bearer ${process.env.privateAppTokenPartner}`
        }
    }).catch(console.log);

    const { results, paging } = response.data;


    const ticketContent = [];

    for (const result of results) {
        ticketContent.push(result.properties)
    }

    return ticketContent.reverse();

}


exports.getTicket = async (id = null) => {

    if (!id) throw new Error('you need to set an id for the ticket ');

    const apiUrl = `https://api.hubapi.com/crm/v3/objects/tickets/${id}?properties=subject,content,hs_ticket_category`;

    const response = await axios.get(apiUrl, {
        headers: {
            authorization: `Bearer ${process.env.privateAppTokenPartner}`
        }
    }).catch(console.log);


    return response.data;

}


exports.getAssociatedEmailsFromTicketId = async (id) => {

    const endpoint = `https://api.hubapi.com/crm/v4/objects/tickets/${id}/associations/emails`;

    console.log(endpoint);
    
    return axios.get(endpoint, axiosConfig);
}





exports.authVisitor = async (email) => {

    if (!email) throw new Error('you need to set an email ');

    const url = 'https://api.hubspot.com/conversations/v3/visitor-identification/tokens/create';

    const postData = {
        email
    };

    const response = await axios.post(url, postData, axiosConfig).catch(axiosErrorHandler)

    if (!response) throw new Error(`API didn't respond...`)

    if (!response.data) throw new Error(`API didn't respond with data ...`)

    if (!response.data.token) throw new Error(`API didn't respond with a token ...`)

    return response.data.token;

}



exports.adddeal = async (properties) => {

    if (!privateAppToken) throw new Error(`There's not privateAppToken setup`);

    const endpoint = `https://api.hubapi.com/crm/v3/objects/deals`;

    return await axios.post(endpoint, properties, axiosConfig);
};