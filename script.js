// --- Variables globales ---
let votes = {};
let total = 0;
let moyenne = 0;
let modeTest = true;

// --- Connexion Twitch (tmi.js requise en mode live) ---
let client;
try {
  client = new tmi.Client({
    channels: ['zarachiiii']
  });
  client.connect();
} catch (e) {
  console.warn("TMI non chargé (mode test local)");
}

// --- Gestion des messages du chat (mode LIVE) ---
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

// --- Fonctions principales ---
function recalculerMoyenne() {
  const nbVotants = Object.keys(votes).length;
  if (nbVotants === 0) {
    document.getElementById('note-moyenne').textContent = 'Note moyenne : 0 / 20';
    document.getElementById('vote-info').textContent = '0 votants';
    document.getElementById('remplissage').style.width = '0%';
    document.getElementById('votants').innerHTML = '';
    return;
  }
  total = Object.values(votes).reduce((a, b) => a + b, 0);
  moyenne = total / nbVotants;
  // Affiche la note moyenne
  const noteElem = document.getElementById('note-moyenne');
  noteElem.textContent = `Note moyenne : ${moyenne.toFixed(1)} / 20`;
  document.getElementById('vote-info').textContent = `${nbVotants} votant${nbVotants > 1 ? 's' : ''}`;

  // Barre de progression avec animation
  const pourcentage = (moyenne / 20) * 100;
  anime({
    targets: '#remplissage',
    width: `${pourcentage}%`,
    duration: 900,
    easing: 'easeOutElastic(1, .8)'
  });

  // Effet flash à chaque update
  noteElem.classList.add('flash');
  setTimeout(() => noteElem.classList.remove('flash'), 400);

  // Liste des 5 derniers votants
  const votantsElem = document.getElementById('votants');
  const recentVotants = Object.keys(votes).slice(-5).reverse();
  votantsElem.innerHTML = recentVotants.map(pseudo => `<li>${pseudo} : ${votes[pseudo]}</li>`).join('');
}

// --- MODE TEST ---
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
  recalculerMoyenne();
}

function toggleMode() {
  modeTest = !modeTest;
  resetNotes();
  const indic = document.getElementById('mode-indicateur');
  indic.textContent = modeTest ? "Mode : TEST" : "Mode : LIVE";
  indic.style.color = modeTest ? "#00ffaa" : "#ff5555";
  document.getElementById('test-actions').style.display = modeTest ? '' : 'none';
}

// Au chargement, cacher les actions test si mode LIVE
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('test-actions').style.display = modeTest ? '' : 'none';
  recalculerMoyenne();
});
