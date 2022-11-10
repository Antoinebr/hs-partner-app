const faker = require("@faker-js/faker").faker;


exports.createSirenData = (domainName) => {

    if (domainName === undefined) throw new Error(`domainName needs to be set, we recieved  ${typeof domainName}`)

    const solvabiliteValues = ["Tres Bonne", "Bonne", "Moyenne"];

    const siren = {
        domainName: domainName,
        siret: faker.datatype.number({
            min: 200000000000001,
            max: 900000000000001
        }),
        solvabilite: solvabiliteValues[Math.floor(Math.random() * 3)]
    }

    return siren;
}