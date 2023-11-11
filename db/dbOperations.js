let dbClient;
let dbName;

function dbSetClient(client) {
    dbClient = client;
}
function dbSetName(name) {
    dbName = name;
}

async function dbInsert(collection, data) {

    const db = dbClient.db(dbName);

    const theCollection = db.collection(collection);

    const insertResult = await theCollection.insertOne(data);
    
    return insertResult;

}

async function dbFind(collection, data) {

    const db = dbClient.db(dbName);

    const theCollection = db.collection(collection);

    const foundItem = await theCollection.findOne(data);

    return foundItem;
}

module.exports = { dbInsert, dbFind, dbSetClient, dbSetName }

