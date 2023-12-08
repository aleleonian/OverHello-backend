# OverHello-backend

This is a silly app that I codes when I was laid off and had nothing to do.

### What is it about

The app represents a complicated way to say Hello <YOUR_NAME>.
When you input your name, this is what will happen:
* If your browser allows it, the app will say hello to you using text to speech.
* The app will scrape data about your name from behindthename.com and will display it to you.
* If there's enough information, the app will:
    * Create a google drive spreadsheet with international equivalents of your name
    * Take a snapshot (a picture) of this spreadsheet to show it to you.
* Then the app will translate your name to morse code and will create a little video on the fly showing how your name spells in morse
* Finally the app will get in touch with a Twitter Bot (that I also coded) which runs in a Docker container (Just to make things more complicated) that does NOT use the Twitter API and will tweet a random hello to you.
* The app will also generate a QR code that links to the aforementioned tweet.
* That's it.

## Code
This app was built in Node.js and MongoDB. I deployed it to Heroku. The front-end was written in React.js. The Twitter Bot was written in Node.js and Docker.

You can use it live at:

https://overhello-frontend-0d0f00dd7856.herokuapp.com/

### Source:

* https://github.com/aleleonian/OverHello-frontend
* https://github.com/aleleonian/OverHello-backend
* https://github.com/aleleonian/OverHello-xBot

## Environment Variables

You must set many env vars, in a .env file for dotenv to read, otherwise the app won't run properly.

### `PORT` 
The port the app will use
### `CORS_HOST` 
The front-end host address. The backend will let this host perform CORS requests.
### `THIS_SERVER`
The address where this app is running.
### `DB_NAME`
Name of the DB that will hold the data this app uses. 
### `DB_USER`
The username that is used to connect to the DB.
### `DB_PASS`
Duh
### `DB_HOST`
The DB host.
### `SHEETS_ID`
An id used to connect to google drive
### `SHEETS_URL`
The url to the google drive spreadsheet you'll be manipulating
### `SHEETS_EMAIL`
The email address you used to set-up your google drive spreadsheet API thingy
### `SHEETS_KEY`
A private key used to communicate with google drive. Make sure the key is wrapped in double and single quotes. Ie: SHEETS_KEY='"-----BEGIN PRIVATE---whatever----END PRIVATE KEY-----\n"'
### `XBOT_SERVER`
The URL where the Twitter/X bot can be reached at. Mine is: https://secure-castle-92738-77ceb182126c.herokuapp.com
