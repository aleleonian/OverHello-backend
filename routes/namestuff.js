// "Armenian Manvel" < - si hay un espacio 0 es nationality y 1 es name
// "Biblical Emmanuel, Immanuel" < - la coma separa nombres, lo que hay antes y después de una coma son nombres
// "Biblical Greek Emmanouel" < - si hay dos espacios[2] es nombre, todo lo anterior
// "Italian Emanuele, Emmanuele, Manuele"
// "Late Greek Manouel, Manuel"
// "Portuguese (Brazilian) Manoel"

// si hay "," entonces los nombres comienzan en el indexOf(" ") que esté antes de indexOf(",");

let namesObject = { "name": "Manuel", "userId": 1699747775161, "names": ["Armenian Manvel", "Basque Imanol", "Biblical Emmanuel, Immanuel", "Biblical Greek Emmanouel", "Biblical Hebrew Immanuel", "Biblical Latin Emmanuhel", "Bulgarian Emanuil", "Catalan Manel", "Croatian Emanuel", "Czech Emanuel", "Danish Emanuel", "English Emmanuel", "French Emmanuel, Manuel", "Galician Manoel", "German Emanuel, Immanuel", "Greek Emmanouil", "Hebrew Immanuel", "Hungarian Emánuel", "Italian Emanuele, Emmanuele, Manuele", "Late Greek Manouel, Manuel", "Norwegian Emanuel", "Portuguese Emanuel", "Portuguese (Brazilian) Manoel", "Romanian Emanoil, Emanuel", "Russian Emmanuil", "Slovak Emanuel", "Swedish Emanuel"] };

const namesArray =
    [
        'Armenian Manvel',
        'Basque Imanol',
        'Biblical Emmanuel, Immanuel',
        'Biblical Greek Emmanouel',
        'Biblical Hebrew Immanuel',
        'Biblical Latin Emmanuhel',
        'Bulgarian Emanuil',
        'Catalan Manel',
        'Croatian Emanuel',
        'Czech Emanuel',
        'Danish Emanuel',
        'English Emmanuel',
        'French Emmanuel, Manuel',
        'Galician Manoel',
        'German Emanuel, Immanuel',
        'Greek Emmanouil',
        'Hebrew Immanuel',
        'Hungarian Emánuel',
        'Italian Emanuele, Emmanuele, Manuele',
        'Late Greek Manouel, Manuel',
        'Norwegian Emanuel',
        'Portuguese Emanuel',
        'Portuguese (Brazilian) Manoel',
        'Romanian Emanoil, Emanuel',
        'Russian Emmanuil',
        'Slovak Emanuel',
        'Swedish Emanuel'
    ];

let spreadsheetObjectsArray = [];

namesArray.forEach(equivalent => {
    let equivalentObj = {};
    if (equivalent.indexOf(",") > -1) {
        let nameArray = equivalent.split(",");
        const name = nameArray[0].substring(nameArray[0].lastIndexOf(" ") + 1, nameArray[0].length);
        const nationality = nameArray[0].substring(0, nameArray[0].indexOf(name) - 1);
        equivalentObj.Nationality = nationality;
        equivalentObj.Equivalent = name;
        for (let i = 1; i < nameArray.length; i++) {
            equivalentObj.Equivalent += ", " + nameArray[i];
        }
    }
    else {
        const name = equivalent.substring(equivalent.lastIndexOf(" ") + 1, equivalent.length);
        const nationality = equivalent.substring(0, equivalent.indexOf(name) - 1);
        equivalentObj.Nationality = nationality;
        equivalentObj.Equivalent = name;
    }
    spreadsheetObjectsArray.push(equivalentObj);
})

console.log(spreadsheetObjectsArray);

function getName(string) {
    return string.substring(string.lastIndexOf(" ") + 1, string.length);
}
function getNationality(string, name) {
    return string.substring(0, string.indexOf(name) - 1);
}