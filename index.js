// Prédiction de texte basée sur un HMM pour clavier AZERTY avec modèle de langage bigramme
// Dictionnaire des mots francais courants et leurs fréquences
const dictionnaireFrancais = {
    "de": 0.071, "la": 0.055, "le": 0.047, "et": 0.041, "les": 0.039,
    "des": 0.037, "en": 0.036, "un": 0.035, "du": 0.033, "une": 0.032,
    "à": 0.031, "que": 0.030, "est": 0.027, "pour": 0.025, "dans": 0.024,
    "qui": 0.023, "ce": 0.022, "il": 0.021, "au": 0.020, "pas": 0.019,
    "sur": 0.018, "se": 0.017, "plus": 0.016, "par": 0.016, "on": 0.015,
    "ne": 0.015, "sont": 0.014, "je": 0.014, "vous": 0.013, "avec": 0.013,
    "son": 0.012, "elle": 0.012, "nous": 0.011, "mais": 0.011, "comme": 0.010,
    "ou": 0.010, "si": 0.010, "leur": 0.009, "y": 0.009, "ont": 0.009,
    "être": 0.009, "faire": 0.008, "tout": 0.008, "cette": 0.008, "aussi": 0.008,
    "bien": 0.007, "peut": 0.007, "ces": 0.007, "sans": 0.007, "même": 0.007,
    "avoir": 0.006, "aux": 0.006, "deux": 0.006, "très": 0.006, "été": 0.006,
    "fait": 0.006, "votre": 0.005, "dont": 0.005, "alors": 0.005, "dire": 0.005,
    "nos": 0.005, "fois": 0.005, "tous": 0.005, "peu": 0.004, "autre": 0.004,
    "car": 0.004, "entre": 0.004, "temps": 0.004, "ça": 0.004, "moi": 0.004,
    "après": 0.004, "faut": 0.003, "ainsi": 0.003, "voir": 0.003, "sa": 0.003,
    "bon": 0.003, "mon": 0.003, "lui": 0.003, "donc": 0.003, "me": 0.003,
    "quand": 0.003, "encore": 0.003, "toujours": 0.003, "monde": 0.003, "aller": 0.003,
    "là": 0.003, "moins": 0.003, "jour": 0.003, "donner": 0.003, "où": 0.003,
    "années": 0.002, "venir": 0.002, "sous": 0.002, "prendre": 0.002, "mettre": 0.002,
    "grand": 0.002, "contre": 0.002, "depuis": 0.002, "non": 0.002, "notre": 0.002,
    "vie": 0.002, "rien": 0.002, "avant": 0.002, "dernier": 0.002, "premier": 0.002,
    "jamais": 0.002, "suite": 0.002, "quelques": 0.002, "lors": 0.002, "chaque": 0.002,
    "nouveau": 0.002, "moment": 0.002, "merci": 0.002, "an": 0.002, "rue": 0.002,
    "toute": 0.002, "partie": 0.001, "personne": 0.001, "travail": 0.001, "quatre": 0.001
    // D'autres mots fréquents seraient ajoutés dans une implémentation complète
};

// Définition de la disposition du clavier AZERTY avec les touches adjacentes
const dispoClavier = {
    'a': ['z', 'q', 's'],
    'z': ['a', 'e', 'q', 's', 'd'],
    'e': ['z', 'r', 's', 'd', 'f'],
    'r': ['e', 't', 'd', 'f', 'g'],
    't': ['r', 'y', 'f', 'g', 'h'],
    'y': ['t', 'u', 'g', 'h', 'j'],
    'u': ['y', '!', 'i', 'h', 'j', 'k'],
    'i': ['u', '!', 'o', 'j', 'k', 'l'],
    'o': ['i', 'p', 'k', 'l', 'm'],
    'p': ['o', 'l', 'm'],
    'q': ['a', 'z', 's', 'w'],
    's': ['q', 'a', 'z', 'e', 'd', 'w', 'x'],
    'd': ['s', 'z', 'e', 'r', 'f', 'x', 'c'],
    'f': ['d', 'e', 'r', 't', 'g', 'c', 'v'],
    'g': ['f', 'r', 't', 'y', 'h', 'v', 'b'],
    'h': ['g', 't', 'y', 'u', 'j', 'b', 'n'],
    'j': ['h', 'y', 'u', 'i', 'k', 'n', ','],
    'k': ['j', 'u', 'i', 'o', 'l', ',', ';'],
    'l': ['k', 'i', 'o', 'p', 'm', ';', ':'],
    'm': ['l', 'o', 'p', ':', '='],
    'w': ['q', 's', 'x'],
    'x': ['w', 's', 'd', 'c'],
    'c': ['x', 'd', 'f', 'v'],
    'v': ['c', 'f', 'g', 'b'],
    'b': ['v', 'g', 'h', 'n'],
    'n': ['b', 'h', 'j', ','],
    ',': ['n', 'j', 'k', ';'],
    ';': [',', 'k', 'l', ':'],
    ':': [';', 'l', 'm', '='],
    '!': ['u', 'i'],
    ' ': [' ']
};

// Corpus français simplifié pour le modèle bigramme
const corpus = `
La France est un pays situé en Europe occidentale.
Sa capitale est Paris, surnommée la ville lumière.
Le français est une langue romane parlée dans le monde entier.
La gastronomie française est célèbre pour ses vins et ses fromages.
Les monuments comme la Tour Eiffel ou le Louvre sont mondialement connus.
La littérature française compte de nombreux auteurs célèbres comme Victor Hugo.
`;

// Fonction pour préparer le corpus et calculer les bigrammes
function preparerCorpus(texte) {
    // Normaliser le texte (minuscules, suppression ponctuation)
    const texteNormalise = texte.toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .replace(/\s{2,}/g, " ");

    // Diviser en mots
    const mots = texteNormalise.trim().split(/\s+/);

    // Création des bigrammes
    const bigrammes = {};
    const compteurMots = {};

    // Compter les occurrences de chaque mot
    mots.forEach(mot => {
        compteurMots[mot] = (compteurMots[mot] || 0) + 1;
    });

    // Créer les bigrammes
    for (let i = 0; i < mots.length - 1; i++) {
        const motActuel = mots[i];
        const motSuivant = mots[i + 1];

        if (!bigrammes[motActuel]) {
            bigrammes[motActuel] = {};
        }

        bigrammes[motActuel][motSuivant] = (bigrammes[motActuel][motSuivant] || 0) + 1;
    }

    // Calculer les probabilités
    const probasBigram = {};

    Object.keys(bigrammes).forEach(motActuel => {
        probasBigram[motActuel] = {};

        Object.keys(bigrammes[motActuel]).forEach(motSuivant => {
            // Probabilité = nombre d'occurrences du bigramme / nombre d'occurrences du premier mot
            probasBigram[motActuel][motSuivant] = bigrammes[motActuel][motSuivant] / compteurMots[motActuel];
        });
    });

    return probasBigram;
}

// Calculer les probabilités de bigrammes à partir du corpus
const probasBigram = preparerCorpus(corpus);

// Probabilités d'émission HMM — probabilité de taper une touche donnée la touche visée
// Ceci modélise les erreurs de frappe en fonction de la proximité des touches
function buildEmissionMatrix() {
    const emissionMatrix = {};

    for (const key in dispoClavier) {
        emissionMatrix[key] = {};

        // Forte probabilité pour la bonne touche
        emissionMatrix[key][key] = 0.8;

        // Répartition du reste de la probabilité entre les touches adjacentes
        const adjacentKeys = dispoClavier[key];
        const adjacentKeyprobabilite = 0.2 / adjacentKeys.length;

        for (const adjacentKey of adjacentKeys) {
            if (adjacentKey !== key) {
                emissionMatrix[key][adjacentKey] = adjacentKeyprobabilite;
            }
        }
    }

    return emissionMatrix;
}

const emissionMatrix = buildEmissionMatrix();

// Fonction pour obtenir des candidats de mots pouvant correspondre à la saisie
function getWordCandidates(typedInput) {
    const candidates = [];

    for (const word in dictionnaireFrancais) {
        if (word.length === typedInput.length) {
            let probabilite = calculateMatchprobabilite(typedInput, word);
            if (probabilite > 0.01) {
                candidates.push({
                    word: word,
                    probabilite: probabilite * dictionnaireFrancais[word]
                });
            }
        }
    }

    return candidates.sort((a, b) => b.probabilite - a.probabilite);
}

// Calcule la probabilité que la saisie corresponde à un mot candidat
function calculateMatchprobabilite(typedInput, candidateWord) {
    if (typedInput.length !== candidateWord.length) return 0;

    let probabilite = 1.0;
    for (let i = 0; i < typedInput.length; i++) {
        const typed = typedInput[i];
        const intended = candidateWord[i];

        if (emissionMatrix[intended] && emissionMatrix[intended][typed]) {
            probabilite *= emissionMatrix[intended][typed];
        } else {
            probabilite *= 0.01;
        }
    }

    return probabilite;
}

// Génère des prédictions de mot suivant en fonction du texte actuel
function predictNextWord(texteActuel) {
    const words = texteActuel.trim().split(/\s+/);
    const lastWord = words[words.length - 1].toLowerCase();

    if (probasBigram[lastWord]) {
        return Object.entries(probasBigram[lastWord])
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);
    }

    return Object.entries(dictionnaireFrancais)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);
}

// Fonction auxiliaire pour choisir un mot selon sa probabilité
function choisirMotSelonProbabilite(mots, probabilites) {
    const total = probabilites.reduce((sum, prob) => sum + prob, 0);
    const valeurAleatoire = Math.random() * total;

    let somme = 0;
    for (let i = 0; i < mots.length; i++) {
        somme += probabilites[i];
        if (valeurAleatoire <= somme) {
            return mots[i];
        }
    }

    return mots[mots.length - 1]; // En cas d'erreur d'arrondi
}

// Générateur de phrases aléatoires basé sur HMM et bigrammes
class GenerateurPhraseAleatoire {
    constructor() {
        this.startWords = ["la", "le", "les", "un", "une", "je", "nous", "vous", "il", "elle"];
        this.endPunctuation = [".", ".", ".", "!", "?"];
    }

    // Génère une phrase aléatoire à l'aide des transitions HMM et bigrammes
    generateSentence(minLength = 5, maxLength = 15) {
        let sentence = [this.startWords[Math.floor(Math.random() * this.startWords.length)]];
        const targetLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

        while (sentence.length < targetLength) {
            const lastWord = sentence[sentence.length - 1].toLowerCase();
            let nextWord;

            if (probasBigram[lastWord]) {
                const transitions = Object.entries(probasBigram[lastWord]);
                const totalProb = transitions.reduce((sum, [_, prob]) => sum + prob, 0);
                let randomValue = Math.random() * totalProb;

                for (const [word, prob] of transitions) {
                    randomValue -= prob;
                    if (randomValue <= 0) {
                        nextWord = word;
                        break;
                    }
                }

                if (!nextWord) {
                    nextWord = transitions[0][0];
                }
            } else {
                const commonWords = Object.keys(dictionnaireFrancais);
                nextWord = commonWords[Math.floor(Math.random() * commonWords.length)];
            }

            sentence.push(nextWord);
        }

        sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1);
        const punctuation = this.endPunctuation[Math.floor(Math.random() * this.endPunctuation.length)];

        return sentence.join(" ") + punctuation;
    }

    // Génère plusieurs phrases
    generateParagraph(sentenceCount = 3) {
        const sentences = [];
        for (let i = 0; i < sentenceCount; i++) {
            sentences.push(this.generateSentence());
        }
        return sentences.join(" ");
    }

    // Fonction pour générer du texte avec le modèle bigramme
    genererTexte(motInitial, longueur) {
        let texteGenere = [motInitial];
        let motActuel = motInitial;

        for (let i = 0; i < longueur - 1; i++) {
            // Si le mot n'a pas de successeurs connus, terminer la génération
            if (!probasBigram[motActuel]) {
                break;
            }

            const successeurs = Object.keys(probasBigram[motActuel]);
            const probabilites = successeurs.map(mot => probasBigram[motActuel][mot]);

            // Sélectionner un mot suivant selon sa probabilité
            const motSuivant = choisirMotSelonProbabilite(successeurs, probabilites);
            texteGenere.push(motSuivant);
            motActuel = motSuivant;
        }

        return texteGenere.join(" ");
    }
}

// Classe principale du clavier qui intègre la prédiction de texte HMM et bigramme
class HMMclavier {
    constructor() {
        this.texteActuel = "";
        this.motActuel = "";
        this.suggestions = [];
        this.generateurPhrase = new GenerateurPhraseAleatoire();
    }

    // Gestion d'un appui sur une touche
    keyPress(key) {
        if (key === ' ') {
            this.texteActuel += this.motActuel + ' ';
            this.motActuel = "";
            this.suggestions = predictNextWord(this.texteActuel);
        } else if (key === 'backspace') {
            if (this.motActuel.length > 0) {
                this.motActuel = this.motActuel.slice(0, -1);
            } else if (this.texteActuel.length > 0) {
                this.texteActuel = this.texteActuel.slice(0, -1);
                const words = this.texteActuel.trim().split(/\s+/);
                if (words.length > 0 && this.texteActuel.endsWith(' ') === false) {
                    this.motActuel = words.pop();
                    this.texteActuel = this.texteActuel.slice(0, this.texteActuel.length - this.motActuel.length);
                }
            }
        } else {
            this.motActuel += key;
            this.suggestions = getWordCandidates(this.motActuel)
                .slice(0, 3)
                .map(candidate => candidate.word);
        }

        return {
            texteActuel: this.texteActuel,
            motActuel: this.motActuel,
            suggestions: this.suggestions
        };
    }

    // Sélection d'une suggestion
    selectSuggestion(index) {
        if (index >= 0 && index < this.suggestions.length) {
            this.motActuel = this.suggestions[index];
            this.suggestions = predictNextWord(this.texteActuel + this.motActuel);
        }

        return {
            texteActuel: this.texteActuel,
            motActuel: this.motActuel,
            suggestions: this.suggestions
        };
    }

    // Obtenir le texte complet (texte courant + mot courant)
    texteEntier() {
        return this.texteActuel + this.motActuel;
    }

    // Charger une phrase aléatoire et la traiter caractère par caractère
    chargementPhraseAleatoire() {
        const sentence = this.generateurPhrase.generateSentence();
        console.log("Phrase aléatoire générée :", sentence);
        console.log("Traitement caractère par caractère pour simuler la frappe...");

        this.texteActuel = "";
        this.motActuel = "";
        this.suggestions = [];

        const results = [];
        for (let i = 0; i < sentence.length; i++) {
            const char = sentence[i].toLowerCase();
            if (Object.keys(dispoClavier).includes(char) || char === ' ') {
                const result = this.keyPress(char);
                results.push({
                    char: char,
                    result: { ...result }
                });
            }
        }

        return {
            originalSentence: sentence,
            finalText: this.texteEntier(),
            processingSteps: results
        };
    }

    // Simulation de frappe avec erreurs selon les probabilités d'émission
    simulationFrappeAvecErreurs(text) {
        const ecrireTexteAvecErreurs = [];

        for (const char of text.toLowerCase()) {
            if (emissionMatrix[char]) {
                const rand = Math.random();
                let probaCumulée = 0;
                let typedChar = char;

                for (const [possibleChar, probabilite] of Object.entries(emissionMatrix[char])) {
                    probaCumulée += probabilite;
                    if (rand <= probaCumulée) {
                        typedChar = possibleChar;
                        break;
                    }
                }

                ecrireTexteAvecErreurs.push(typedChar);
            } else {
                ecrireTexteAvecErreurs.push(char);
            }
        }

        return ecrireTexteAvecErreurs.join('');
    }

    // Générer du texte avec le modèle bigramme
    genererTexteBigramme(motInitial, longueur) {
        return this.generateurPhrase.genererTexte(motInitial, longueur);
    }
}

// Exemple d'utilisation
function demonstrateclavier() {
    const clavier = new HMMclavier();

    console.log("Démarrage de la démonstration du clavier avec disposition AZERTY...");

    console.log("\n1. Chargement d'une phrase aléatoire :");
    const randomSentenceResult = clavier.chargementPhraseAleatoire();
    console.log("Phrase originale :", randomSentenceResult.originalSentence);
    console.log("Texte final avec suggestions :", randomSentenceResult.finalText);

    clavier.texteActuel = "";
    clavier.motActuel = "";

    console.log("\n2. Simulation de saisie avec erreurs...");
    const texteOriginal = "le français est une belle langue";
    const texteAvecErreurs = clavier.simulationFrappeAvecErreurs(texteOriginal);
    console.log("Original :", texteOriginal);
    console.log("Avec erreurs :", texteAvecErreurs);

    console.log("\n3. Génération de texte avec le modèle bigramme :");
    const texteGenere = clavier.genererTexteBigramme("la", 10);
    console.log("Texte généré :", texteGenere);
}

// Exécuter la démonstration
demonstrateclavier();