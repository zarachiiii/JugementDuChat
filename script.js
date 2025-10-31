let votes = {};
let total = 0;
let moyenne = 0;
let modeTest = true; // par défaut test

let client;
try {
  client = new tmi.Client({
    channels: ['zarachiiii'] // ton pseudo Twitch
  });
  client.connect();
} catch (e) {
  console.warn("TMI non chargé (mode test local)");
}

if (typeof tmi !== "undefined") {
  client.on('message', (channel, tags, message, self) => {
    if (self || modeTest) return;
    const pseudo = tags['display-name'] || tags.username;
    const regex = /!note\s*(\d{1,2})/i;
    const match = message.match(regex);

    if (match) {
      let note = parseInt(match[1]);
      if (isNaN(note) || note < 0 || note > 20) return;

      if (votes[pseudo] !== undefined) total -= votes[pseudo];
      votes[pseudo] = note;
      recalculerMoyenne();
    }
  });
}

function recalculerMoyenne() {
  const nbVotants = Object.keys(votes).length;
  if (nbVotants === 0) return;

  total = Object.values(votes).reduce((a, b) => a + b, 0);
  moyenne = total / nbVotants;

  document.getElementById('note-moyenne').textContent = `Note moyenne : ${moyenne.toFixed(1)} / 20`;
  document.getElementById('vote-info').textContent = `${nbVotants} votant${nbVotants > 1 ? 's' : ''}`;
  const pourcentage = (moyenne / 20) * 100;
  document.getElementById('remplissage').style.width = `${pourcentage}%`;
}

function ajouterNoteAleatoire() {
  if (!modeTest) return;
  const pseudo = 'testUser' + Math.floor(Math.random() * 1000);
  const note = Math.floor(Math.random() * 21);
  votes[pseudo] = note;
  recalculerMoyenne();
}

function ajouterNote(valeur) {
  if (!modeTest) return;
  const pseudo = 'testUser' + Math.floor(Math.random() * 1000);
  votes[pseudo] = valeur;
  recalculerMoyenne();
}

function resetNotes() {
  votes = {};
  total = 0;
  moyenne = 0;
  document.getElementById('note-moyenne').textContent = 'Note moyenne : 0 / 20';
  document.getElementById('vote-info').textContent = '0 votants';
  document.getElementById('remplissage').style.width = '0%';
}

function toggleMode() {
  modeTest = !modeTest;
  resetNotes();
  const indic = document.getElementById('mode-indicateur');
  indic.textContent = modeTest ? "Mode : TEST" : "Mode : LIVE";
  indic.style.color = modeTest ? "#ff6666" : "#ff0000";
}
