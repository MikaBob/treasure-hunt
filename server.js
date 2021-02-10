const RELEASE_DATE = new Date('2021-02-09T13:00:00Z');
const PUBLIC_HTML = '/public_html/';
const NODE_MODULES = '/node_modules/';
const CLUES_DATABASE = './clues.json';
const CLUES_HTML = './views/clues_html';

const bodyParser = require('body-parser');
const express = require('express');
const fs	= require('fs');

let app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const playersProgress = []

const playersProgressHistory = []

// View engine setup
app.set('view engine', 'ejs');

/*
app.get('*', (req, res, next) => {
	console.log(req.url);
	next();
});
*/

app.get('/', (req, res) => {
	let rightNow = new Date();

	// Rendering ./views/*.ejs
	if(rightNow <= RELEASE_DATE) {
		res.render('teaser', {releaseDate: RELEASE_DATE});
	} else {
		res.render('index');
	}
});

app.get(PUBLIC_HTML+'*', (req, res, next) => {
	let path = '.'+PUBLIC_HTML+req.url.replace(PUBLIC_HTML, '');
	sendFileIfFileExist(path, res);
});

app.get(NODE_MODULES+'*', (req, res, next) => {
	let path = '.'+NODE_MODULES+req.url.replace(NODE_MODULES, '');
	sendFileIfFileExist(path, res);
});

app.get('/favicon.ico', (req, res, next) => {
	res.setHeader('Content-Type', 'image/x-icon');
	fs.createReadStream('.'+PUBLIC_HTML+'logo.ico').pipe(res);
});

app.post('/getProgress', (req, res) => {
	progressHtml = "<h3>Progrès des participants</h3><p>"
	for (progress in playersProgress) {
		progressHtml += "<span>" + progress + " : " + playersProgress[progress][0] + "/13</span><br/>"
	}
	progressHtml += "</p>"
	res.end(progressHtml);
});

app.post('/getNextStep', (req, res) => {
	const { answer, currentKey, pseudo } = req.body;

	sanitizedAnswer = answer
		.replace(/é|è|ë|ê/ig,'e')
		.replace(/ã|à|ä|@/ig,'a')
		.replace(/û|ü|ù/ig,'u')
		.replace(/î|ï/ig,'i')
		.replace(/õ|ô|ö/ig,'o')
		.replace(/ÿ/ig,'y')
		.replace(/\W/ig, '')
		.toUpperCase();


	res.setHeader('Content-Type', 'application/json');

	if(sanitizedAnswer !== '') {
		// Read clue database
		fs.readFile(CLUES_DATABASE, (error, data) => {
			if (error) console.error('Clues database not found !');
			let clues = JSON.parse(data),
			isCurrentKeyFound = false, // if the key can not be found, then reset the game
			alreadyFoundClue = false; // skip search if the answer matches

			clues.forEach((clue) => {
				if(alreadyFoundClue) return;

				const { index, acceptableAnswers, key, previousKey } = clue;

				// if the clue follow the chronology
				if(currentKey === previousKey) {

					// if the anwser matches at least one acceptable answer
					if(sanitizedAnswer.search(acceptableAnswers) > -1){
						if(!alreadyFoundClue) {
							alreadyFoundClue = true;
							const cluehtmlPath = CLUES_HTML + '/'+ key +'.html';
							try {
								const clueHtml = fs.readFileSync(cluehtmlPath, {encoding:'utf8', flag:'r'});
								playersProgress[escapeHtml(pseudo)] = [index, Date.now()]
								res.end(JSON.stringify({ err: 'ok', msg: clueHtml, key: key}));
							} catch (err) {
								if (err) console.error('Clue html not found ('+cluehtmlPath+')');
							}
						}
					}
				}

				if(currentKey === key) isCurrentKeyFound = true;
			});

			if(!isCurrentKeyFound) {
				res.end(JSON.stringify({ err: 'reset', msg: '<p class="text-danger">Cette étape n\'est pas dans notre base de données. Vous devez tout reprendre depuis le début...</p>', key: 'A32LD7REEPT'}));
			} else {
				res.end(JSON.stringify({ err: 'wrong', msg: 'Non ce n\'est pas ça :/', key: currentKey}));
			}
		});
	} else {
		res.end(JSON.stringify({ err: 'wrong', msg: 'Non ce n\'est pas ça :/', key: currentKey}));
	}
});

function sendFileIfFileExist(path, res){
	if(fs.existsSync(path)) {
		fs.createReadStream(path).pipe(res);
	}
}

var entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

function escapeHtml (string) {
  return String(string).replace(/[&<>"'`=\/]/g, function (s) {
    return entityMap[s];
  });
}

app.listen(8000, (err) => {
    if (err) console.log(err);
    console.log('Server listening...');
});