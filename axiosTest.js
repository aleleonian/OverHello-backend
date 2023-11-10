
const cheerio = require("cheerio");

main();

async function main() {
    let data = await scrapeNameInfo("Sergio");
    console.log(data);
}

async function scrapeNameInfo(name) {
    let scrapedData = {};

    try {

        let url = `https://www.behindthename.com/name/${name}`;

        let response = await fetch(url);

        // Get the HTML code of the webpage 

        let html = await response.text();

        // console.log("first query->", html);

        let $ = cheerio.load(html);

        let nameData = $('.namedef').text();

        if (nameData.length > 500) {
            nameData = nameData.substring(0, 497) + "...";
        }
        scrapedData.nameData = nameData;

    } catch (error) {
        console.log("Error fetching name data->", error);
        scrapedData.nameData = null;
    }
    try {
        url = `https://www.behindthename.com/name/${name}/related`;

        response = await fetch(url);

        // Get the HTML code of the webpage 
        html = await response.text();

        $ = cheerio.load(html);

        let equivalentsArray = $('#body-inner > div:nth-child(6)').text().trim().split(/\n/)

        scrapedData.equivalent = equivalentsArray[Math.floor(Math.random() * equivalentsArray.length)];

        console.log(JSON.stringify(scrapedData));

    }
    catch (error) {
        console.log("Error fetching equivalent data->", error);
        scrapedData.equivalent = null;
    }

    return scrapedData;


}