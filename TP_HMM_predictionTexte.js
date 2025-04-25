/**
 * Modèles de Markov pour clavier tactile AZERTY
 * Ce programme apprend des modèles de Markov à partir d'un texte
 * et prédit les trois mots les plus probables pour compléter des phrases incomplètes
 */

const keyboardLayout = {
    'a': ['z', 'q', 's'],
    'z': ['a', 'e', 's', 'd'],
    'e': ['z', 'r', 'd', 'f'],
    'r': ['e', 't', 'f', 'g'],
    't': ['r', 'y', 'g', 'h'],
    'y': ['t', 'u', 'h', 'j'],
    'u': ['y', 'i', 'j', 'k'],
    'i': ['u', 'o', 'k', 'l'],
    'o': ['i', 'p', 'l', 'm'],
    'p': ['o', 'm'],
    'q': ['a', 'w', 's'],
    's': ['q', 'a', 'z', 'd', 'w', 'x'],
    'd': ['s', 'z', 'e', 'f', 'x', 'c'],
    'f': ['d', 'e', 'r', 'g', 'c', 'v'],
    'g': ['f', 'r', 't', 'h', 'v', 'b'],
    'h': ['g', 't', 'y', 'j', 'b', 'n'],
    'j': ['h', 'y', 'u', 'k', 'n', ','],
    'k': ['j', 'u', 'i', 'l', ',', ';'],
    'l': ['k', 'i', 'o', 'm', ';', ':'],
    'm': ['l', 'o', 'p', ':', '!'],
    'w': ['q', 's', 'x'],
    'x': ['w', 's', 'd', 'c'],
    'c': ['x', 'd', 'f', 'v'],
    'v': ['c', 'f', 'g', 'b'],
    'b': ['v', 'g', 'h', 'n'],
    'n': ['b', 'h', 'j', ','],
    ',': ['n', 'j', 'k', ';'],
    ';': ['k', 'l', ':'],
    ':': ['l', 'm', '!'],
    '!': ['m', ':'],
    ' ': [' ']
};

class MarkovModelLearner {
    constructor() {
        this.unigramCounts = {};
        this.bigramCounts = {};
        this.trigramCounts = {};
        this.emissionMatrix = {};
        this.transitionMatrix = {};
        this.totalWords = 0;
        this.grammarRules = this.initGrammarRules();
    }

    initGrammarRules() {
        return {
            articles: ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'au', 'aux'],
            pronouns: ['je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'on', 'ce', 'cette', 'ces', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses', 'notre', 'votre', 'leur', 'leurs', "l'"],
            verbs: ['est', 'sont', 'a', 'ont', 'fait', 'va', 'vont', 'peut', 'veut', 'dit', 'parle', 'mange', 'dort', 'travaille', 'étudie', 'lit', 'écrit', 'aime', 'joue', 'prépare', 'visite', 'explique', 'dessine', 'ferme', 'ouvre', 'répare', 'conduit', 'enseigne', 'apprend', 'regarde', 'écoute'],
            verbInfinitive: ['être', 'avoir', 'faire', 'aller', 'pouvoir', 'vouloir', 'dire', 'parler', 'manger', 'dormir', 'travailler', 'étudier', 'lire', 'écrire', 'aimer', 'jouer', 'préparer', 'visiter', 'expliquer', 'dessiner', 'fermer', 'ouvrir', 'réparer', 'conduire', 'enseigner', 'apprendre', 'regarder', 'écouter'],
            prepositions: ['à', 'de', 'dans', 'par', 'pour', 'en', 'vers', 'avec', 'sans', 'sous', 'sur', 'chez', 'entre', 'derrière', 'devant', 'contre', 'pendant', 'après', 'avant', 'depuis', "jusqu'à"]        };
    }

    preprocessText(text) {
        const normalized = text.toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
            .replace(/\s{2,}/g, " ")
            .trim();
        return normalized.split(/\s+/).filter(word => word.length > 0);
    }

    learnWordModels(text) {
        const words = this.preprocessText(text);
        this.totalWords = words.length;

        // Unigrammes
        words.forEach(word => {
            this.unigramCounts[word] = (this.unigramCounts[word] || 0) + 1;
        });

        // Bigrammes
        for (let i = 0; i < words.length - 1; i++) {
            const currentWord = words[i];
            const nextWord = words[i + 1];

            if (!this.bigramCounts[currentWord]) {
                this.bigramCounts[currentWord] = {};
            }
            this.bigramCounts[currentWord][nextWord] = (this.bigramCounts[currentWord][nextWord] || 0) + 1;
        }

        // Trigrammes
        for (let i = 0; i < words.length - 2; i++) {
            const wordPair = `${words[i]} ${words[i+1]}`;
            const nextWord = words[i + 2];

            if (!this.trigramCounts[wordPair]) {
                this.trigramCounts[wordPair] = {};
            }
            this.trigramCounts[wordPair][nextWord] = (this.trigramCounts[wordPair][nextWord] || 0) + 1;
        }
    }

    learnCharacterModel(text) {
        const cleanText = text.toLowerCase().replace(/[^\w\sàáâãäåçèéêëìíîïñòóôõöùúûüýÿ]/g, "");

        for (let i = 0; i < cleanText.length - 1; i++) {
            const currentChar = cleanText[i];
            const nextChar = cleanText[i + 1];

            if (!this.transitionMatrix[currentChar]) {
                this.transitionMatrix[currentChar] = {};
            }
            this.transitionMatrix[currentChar][nextChar] = (this.transitionMatrix[currentChar][nextChar] || 0) + 1;
        }

        Object.keys(this.transitionMatrix).forEach(char => {
            const total = Object.values(this.transitionMatrix[char]).reduce((sum, count) => sum + count, 0);
            Object.keys(this.transitionMatrix[char]).forEach(nextChar => {
                this.transitionMatrix[char][nextChar] /= total;
            });
        });
    }

    buildEmissionMatrix() {
        for (const key in keyboardLayout) {
            this.emissionMatrix[key] = {};
            this.emissionMatrix[key][key] = 0.8;
            const adjacentKeys = keyboardLayout[key];
            const errorProbability = 0.2 / adjacentKeys.length;

            adjacentKeys.forEach(adjKey => {
                if (adjKey !== key) {
                    this.emissionMatrix[key][adjKey] = errorProbability;
                }
            });
        }
    }

    learnFromText(text) {
        this.learnWordModels(text);
        this.learnCharacterModel(text);
        this.buildEmissionMatrix();
        return this;
    }

    inferWordType(word) {
        if (!word) return 'unknown';
        word = word.toLowerCase();

        // Vérifier les listes de mots connus
        if (this.grammarRules.articles.includes(word)) return 'article';
        if (this.grammarRules.pronouns.includes(word)) return 'pronoun';
        if (this.grammarRules.verbs.includes(word)) return 'verb';
        if (this.grammarRules.verbInfinitive.includes(word)) return 'verb-infinitive';
        if (this.grammarRules.prepositions.includes(word)) return 'preposition';

        // Analyse des terminaisons pour inférer verbes/noms/adjectifs
        if (word.match(/[aeiou]nt$/)) return 'verb';
        if (word.match(/[aeiou]ns$/)) return 'verb';
        if (word.match(/ez$/)) return 'verb';
        if (word.match(/er$|ir$|re$/)) return 'verb-infinitive';
        if (word.match(/eur$|euse$|teur$|trice$/)) return 'noun';
        if (word.match(/tion$|sion$|ment$/)) return 'noun';
        if (word.match(/^[A-Z]/)) return 'proper-noun';
        if (word.match(/e$|s$|x$/)) return 'noun-or-adj';

        return 'unknown';
    }

    getGrammaticalScore(nextWord, lastWord, context) {
        const lastWordType = this.inferWordType(lastWord);
        const nextWordType = this.inferWordType(nextWord);
        let score = 1;

        // Règles de grammaire simples
        if (lastWordType === 'article' && (nextWordType === 'noun-or-adj' || nextWordType === 'noun')) {
            score = 2.0;
        } else if (lastWordType === 'pronoun' && nextWordType === 'verb') {
            score = 2.0;
        } else if (lastWordType === 'verb' && nextWordType === 'article') {
            score = 1.5;
        } else if (lastWordType === 'verb' && nextWordType === 'preposition') {
            score = 1.5;
        } else if (lastWordType === 'preposition' && (nextWordType === 'article' || nextWordType === 'noun' || nextWordType === 'noun-or-adj')) {
            score = 1.8;
        } else if (lastWordType === 'noun' && nextWordType === 'verb') {
            score = 1.3;
        } else if (lastWordType === 'noun-or-adj' && nextWordType === 'preposition') {
            score = 1.4;
        } else if (lastWordType === 'noun-or-adj' && nextWordType === 'noun-or-adj') {
            score = 1.2;
        } else if (lastWordType === 'verb-infinitive' && nextWordType === 'article') {
            score = 1.5;
        }

        // Pénalité pour les répétitions
        if (context && context.includes(nextWord)) {
            score *= 0.8;
        }

        return score;
    }

    predictNextWord(currentWord, context = '', count = 3) {
        let predictions = [];
        const words = context ? context.split(/\s+/) : [];
        words.push(currentWord);
        const recentContext = words.slice(-2).join(' ');

        // D'abord essayer avec le trigramme si on a assez de contexte
        if (context && this.trigramCounts[recentContext]) {
            const total = Object.values(this.trigramCounts[recentContext]).reduce((sum, count) => sum + count, 0);
            const trigramPredictions = Object.keys(this.trigramCounts[recentContext])
                .map(word => {
                    const gramScore = this.getGrammaticalScore(word, currentWord, context);
                    return {
                        word: word,
                        probability: this.trigramCounts[recentContext][word] / total,
                        model: 'trigram',
                        gramScore: gramScore,
                        score: (this.trigramCounts[recentContext][word] / total) * gramScore * 1.5 // Poids plus élevé pour les trigrammes
                    };
                });
            predictions = [...predictions, ...trigramPredictions];
        }

        // Si pas assez de prédictions, utiliser le bigramme
        if (this.bigramCounts[currentWord]) {
            const total = Object.values(this.bigramCounts[currentWord]).reduce((sum, count) => sum + count, 0);
            const bigramPredictions = Object.keys(this.bigramCounts[currentWord])
                .map(word => {
                    const gramScore = this.getGrammaticalScore(word, currentWord, context);
                    return {
                        word: word,
                        probability: this.bigramCounts[currentWord][word] / total,
                        model: 'bigram',
                        gramScore: gramScore,
                        score: (this.bigramCounts[currentWord][word] / total) * gramScore
                    };
                });
            predictions = [...predictions, ...bigramPredictions];
        }

        // Si toujours pas assez, utiliser les unigrammes
        const unigramTotal = this.totalWords;
        const unigramPredictions = Object.keys(this.unigramCounts)
            .filter(word => this.unigramCounts[word] > 1) // Filtrer les mots rares
            .map(word => {
                const gramScore = this.getGrammaticalScore(word, currentWord, context);
                return {
                    word: word,
                    probability: this.unigramCounts[word] / unigramTotal,
                    model: 'unigram',
                    gramScore: gramScore,
                    score: (this.unigramCounts[word] / unigramTotal) * gramScore * 0.5 // Poids moindre pour les unigrammes
                };
            });
        predictions = [...predictions, ...unigramPredictions];

        // Fusionner les prédictions similaires
        const mergedPredictions = {};
        predictions.forEach(pred => {
            if (!mergedPredictions[pred.word] || mergedPredictions[pred.word].score < pred.score) {
                mergedPredictions[pred.word] = pred;
            }
        });

        // Trier et retourner les meilleures prédictions
        return Object.values(mergedPredictions)
            .sort((a, b) => b.score - a.score)
            .slice(0, count)
            .map(pred => ({
                word: pred.word,
                probability: (pred.probability * 100).toFixed(2) + "%",
                model: pred.model,
                fullSuggestion: `${words.join(' ')} ${pred.word}`
            }));
    }
}

class TextPredictor {
    constructor() {
        this.markovLearner = new MarkovModelLearner();
        this.isInitialized = false;
    }

    train(trainingText) {
        this.markovLearner.learnFromText(trainingText);
        this.isInitialized = true;
        return this;
    }

    isIncompleteSentence(sentence) {
        const trimmedSentence = sentence.trim();
        return !trimmedSentence.match(/[.!?]$/);
    }

    extractContext(text) {
        const words = text.trim().split(/\s+/);
        if (words.length <= 1) return { context: '', lastWord: words[0] || '' };

        return {
            context: words.slice(0, -1).join(' '),
            lastWord: words[words.length - 1]
        };
    }

    predictNext(inputText) {
        if (!this.isInitialized) {
            throw new Error("Le prédicteur doit être initialisé avec un texte d'apprentissage avant utilisation.");
        }

        if (!this.isIncompleteSentence(inputText)) {
            return {
                status: "complete",
                message: "La phrase est complète.",
                predictions: []
            };
        }

        const { context, lastWord } = this.extractContext(inputText);
        const predictions = this.markovLearner.predictNextWord(lastWord, context, 3);

        return {
            status: "success",
            originalSentence: inputText.trim(),
            context: context,
            lastWord: lastWord,
            predictions: predictions,
            timestamp: new Date().toISOString()
        };
    }
}

function findIncompleteSentences(text) {
    const cleanedText = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
    const segments = cleanedText.split(/(?<=[.!?])\s+/);
    return segments.filter(segment => {
        const words = segment.trim().split(/\s+/);
        return words.length >= 2 && !/[.!?]$/.test(segment);
    });
}

function findCompleteSentences(text) {
    const sentences = text.match(/[^.!?]+[.!?]/g);
    return sentences ? sentences.map(s => s.trim()) : [];
}

function createIncompleteSentences(completeSentences, count = 5) {
    if (!completeSentences || completeSentences.length === 0) return [];

    return completeSentences
        .map(sentence => {
            const words = sentence.trim().split(/\s+/);
            const keepCount = Math.max(2, Math.floor(words.length * (0.6 + Math.random() * 0.3)));
            return words.slice(0, keepCount).join(' ').replace(/[.!?]$/, '').trim();
        })
        .filter(sentence => sentence.length > 5)
        .slice(0, count);
}

function processIncompleteSentences() {
    const smallText = `
    Le français est une langue romane parlée en France. 
    Je voudrais aller au cinéma demain soir pour voir un film.
    Je voudrais aller au restaurant ce weekend avec mes amis.
    Je voudrais aller à la plage cet été pour me détendre.
    La ville de Paris est la capitale de la France.
    Le président de la République française habite au palais de l'Élysée.
    Les étudiants travaillent dur pour réussir leurs examens.
    Le chat noir dort sur le canapé du salon.
    Mon frère aime jouer au football dans le parc.
    La boulangerie vend du pain frais tous les matins.
    Je prends le métro tous les jours pour aller travailler.
    Il fait beau aujourd'hui, nous pouvons sortir nous promener.
    Le professeur explique la leçon aux élèves attentifs.
    J'ai acheté un nouveau livre que je vais lire ce weekend.
    Nous devons protéger l'environnement pour les générations futures.
    Le musée du Louvre attire des millions de visiteurs chaque année.
    Ma sœur étudie la médecine à l'université.
    Les enfants jouent dans le jardin pendant que leurs parents discutent.
    Je vais faire les courses au supermarché cet après-midi.
    Le train pour Lyon part dans une heure de la gare.
    `;

    try {
        const fs = require('fs');
        let trainingText = smallText;
        let incompleteSentences = [];

        if (fs.existsSync('mots_filtrés.txt')) {
            const rawText = fs.readFileSync('mots_filtrés.txt', 'utf8');
            trainingText = rawText;
            incompleteSentences = findIncompleteSentences(rawText);

            if (incompleteSentences.length < 5) {
                const completeSentences = findCompleteSentences(rawText);
                incompleteSentences = incompleteSentences.concat(
                    createIncompleteSentences(completeSentences, 5 - incompleteSentences.length)
                );
            }
        } else {
            const completeSentences = findCompleteSentences(smallText);
            incompleteSentences = createIncompleteSentences(completeSentences, 5);
        }

        incompleteSentences = incompleteSentences
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)
            .slice(0, 5);

        const predictor = new TextPredictor().train(trainingText);

        console.log("\n=== Prédictions pour phrases incomplètes ===");

        incompleteSentences.forEach((sentence, index) => {
            console.log(`\n--- Phrase ${index+1} ---`);
            console.log(`Entrée: "${sentence}"`);
            const result = predictor.predictNext(sentence);

            if (result.predictions.length > 0) {
                console.log("\nTop 3 prédictions:");
                result.predictions.forEach((pred, i) => {
                    console.log(`${i+1}. "${pred.word}" (${pred.probability})`);
                });
            } else {
                console.log("\nAucune prédiction trouvée pour cette phrase.");
            }
        });

        return {
            status: "success",
            analyzedSentences: incompleteSentences.length
        };

    } catch (error) {
        console.error("Erreur:", error.message);
        return {
            status: "error",
            message: error.message
        };
    }
}

if (require.main === module) {
    processIncompleteSentences();
}

module.exports = {
    MarkovModelLearner,
    TextPredictor,
    findIncompleteSentences,
    findCompleteSentences,
    createIncompleteSentences,
    processIncompleteSentences,
    keyboardLayout
};