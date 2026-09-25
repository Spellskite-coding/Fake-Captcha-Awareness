/*
 * Fake-Captcha-Awareness — site de sensibilisation ClickFix / FileFix
 *
 * GARANTIE DE SÉCURITÉ : ce script n'accède JAMAIS au presse-papier.
 * Aucun appel à navigator.clipboard, document.execCommand('copy'),
 * ni à aucune API d'écriture système. Il ne contient aucune commande.
 * Tous les boutons des fausses pages ne font qu'afficher le message
 * de sensibilisation.
 */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------
     Éléments visuels génériques (volontairement sans marque réelle)
     --------------------------------------------------------- */
  var BOUCLIER = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2 4 7v8c0 7.5 5.1 13.4 12 15 6.9-1.6 12-7.5 12-15V7L16 2z" fill="#3B82C4"/><path d="m11 16 3.5 3.5L21.5 12" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function k(t) { return '<kbd>' + t + '</kbd>'; }

  // Étapes récurrentes, selon l'outil vers lequel le piège envoie
  var ETAPES = {
    executer: function (but) {
      return [
        'Appuyez sur la touche Windows ' + k('⊞') + ' + ' + k('R') + ' pour ouvrir ' + but + '.',
        'Dans cette fenêtre, appuyez sur ' + k('Ctrl') + ' + ' + k('V') + '.',
        'Appuyez sur ' + k('Entrée') + ' sur votre clavier pour terminer.'
      ];
    },
    powershell: function () {
      return [
        'Appuyez sur la touche Windows ' + k('⊞') + ' + ' + k('X') + ' pour ouvrir le menu Utilisateur avancé.',
        'Appuyez sur ' + k('I') + ' pour ouvrir Windows PowerShell ou le Terminal.',
        'Dans la fenêtre qui s\'ouvre, appuyez sur ' + k('Ctrl') + ' + ' + k('V') + '.',
        'Appuyez sur ' + k('Entrée') + ' sur votre clavier pour terminer.'
      ];
    },
    terminal: function (quoi) {
      return [
        'Appuyez sur ' + k('⌘ Cmd') + ' + ' + k('Espace') + ' et tapez «\u00a0Terminal\u00a0».',
        'Appuyez sur ' + k('Entrée') + ' pour ouvrir la fenêtre.',
        'Appuyez sur ' + k('⌘ Cmd') + ' + ' + k('V') + ' pour coller ' + quoi + '.',
        'Appuyez sur ' + k('Entrée') + ' pour terminer.'
      ];
    }
  };

  // Ligne « Vous verrez s'afficher » : l'astuce qui endort la méfiance
  function observe(id) {
    return '<p class="popup-texte">Vous verrez s\'afficher et accepterez :</p>' +
      '<p class="popup-observe"><span class="coche" aria-hidden="true">✔</span> «\u00a0Je ne suis pas un robot – Vérification anti-robots, ID : ' + id + '\u00a0»</p>';
  }

  function popup(o) {
    return '<div class="popup">' +
      '<div class="popup-entete"><span>' + o.haut + '</span><strong>' + o.titre + '</strong></div>' +
      '<div class="popup-corps">' +
        '<p class="popup-texte">' + o.intro + '</p>' +
        '<ol class="etapes-piege">' + o.etapes.map(function (e) { return '<li>' + e + '</li>'; }).join('') + '</ol>' +
        (o.fin || '') +
      '</div>' +
      '<div class="popup-pied"><span>' + (o.pied || 'Effectuez les étapes ci-dessus pour terminer la vérification.') + '</span>' +
        '<button type="button" class="bouton-piege" data-piege>' + (o.bouton || 'VÉRIFIER') + '</button></div>' +
    '</div>';
  }

  function interstitiel(domaine) {
    return '<div class="interstitiel">' +
      '<p class="int-domaine">' + domaine + '</p>' +
      '<p class="int-texte">Vérifiez que vous êtes humain en effectuant l\'action ci-dessous.</p>' +
      '<div class="widget">' +
        '<button type="button" class="case" id="declencheur">' +
          '<span class="case-carre" aria-hidden="true"></span>' +
          '<span class="case-libelle">Vérifiez que vous êtes humain</span>' +
        '</button>' +
        '<span class="marque">' + BOUCLIER + '<span>Protection<br>anti-robots</span></span>' +
      '</div>' +
      '<p class="int-texte">' + domaine + ' doit vérifier la sécurité de votre connexion avant de continuer.</p>' +
      '<p class="int-pied">ID de requête : 8c2f41a9e7b3d016 · Performances et sécurité</p>' +
    '</div>';
  }

  function boiteCase() {
    return '<div class="captcha">' +
      '<div class="captcha-ligne">' +
        '<button type="button" class="case" id="declencheur">' +
          '<span class="case-carre" aria-hidden="true"></span>' +
          '<span class="case-libelle">Je ne suis pas un robot</span>' +
        '</button>' +
        '<span class="marque">' + BOUCLIER + '<span>Protection<br>anti-robots</span></span>' +
      '</div>' +
      '<p class="captcha-pied">Confidentialité · Conditions</p>' +
    '</div>';
  }

  function pageErreur() {
    return '<div class="page-erreur">' +
      '<div class="erreur-alerte" role="alert">' +
        '<p class="erreur-titre"><span class="erreur-icone" aria-hidden="true">!</span> Erreur d\'affichage</p>' +
        '<p>Une erreur s\'est produite lors de l\'affichage de cette page : une police de caractères est manquante sur votre appareil.</p>' +
        '<p>Pour corriger l\'erreur, cliquez sur le bouton «\u00a0Comment corriger\u00a0» et suivez les instructions.</p>' +
        '<button type="button" class="bouton-piege" id="declencheur">Comment corriger</button>' +
      '</div>' +
      '<div class="texte-casse" aria-hidden="true">' +
        '<p>Ã‰â–¯â–¯ lâ€™Ã©tÃ© â–¯â–¯â–¯ Ã  â–¯â–¯ prÃ©vâ–¯ â–¯â–¯â–¯â–¯ lâ€™ â–¯â–¯ Ã¨â–¯â–¯ â–¯â–¯â–¯â–¯ Ã©â–¯â–¯â–¯</p>' +
        '<p>â–¯â–¯â–¯ Ã â–¯â–¯ Ã©â–¯ â–¯â–¯â–¯â–¯â–¯ Ã§â–¯â–¯ â–¯â–¯ Ã´â–¯â–¯â–¯â–¯ â–¯â–¯â–¯ â–¯â–¯</p>' +
      '</div>' +
    '</div>';
  }

  function pageMiseAJour() {
    return '<div class="page-maj">' +
      '<div class="maj-icone" aria-hidden="true"></div>' +
      '<p class="maj-titre">Votre navigateur n\'est plus à jour</p>' +
      '<p class="maj-texte">Une faille de sécurité critique a été découverte dans votre version. Certaines pages ne s\'afficheront plus correctement tant que la mise à jour n\'est pas installée.</p>' +
      '<p class="maj-version">Version actuelle : 128.0.6613 · Version requise : 131.0.6778</p>' +
      '<button type="button" class="bouton-piege maj-bouton" id="declencheur">Mettre à jour</button>' +
    '</div>';
  }

  function pageVisio(outil) {
    function tuile(initiales, nom, couleur) {
      return '<div class="tuile"><span class="avatar ' + couleur + '">' + initiales + '</span><span class="tuile-nom">' + nom + '</span></div>';
    }
    return '<div class="page-visio">' +
      '<div class="visio-grille" aria-hidden="true">' +
        tuile('MC', 'Martine C.', 'av1') + tuile('JP', 'Jean-Pierre', 'av2') + tuile('SL', 'Sophie L.', 'av3') +
        '<div class="tuile tuile-vous"><span class="avatar av4">V</span><span class="tuile-nom">Vous <span class="micro-coupe">🎙️✕</span></span></div>' +
      '</div>' +
      '<div class="visio-alerte">' +
        '<p class="visio-alerte-titre">Problème de micro détecté</p>' +
        '<p>Les autres participants ne peuvent pas vous entendre. Le pilote audio de votre ordinateur doit être réparé.</p>' +
        '<button type="button" class="bouton-piege" id="declencheur">Réparer le problème</button>' +
      '</div>' +
      '<div class="visio-barre" aria-hidden="true"><span>🎙️</span><span>📷</span><span>💬</span><span class="raccrocher">📞</span></div>' +
    '</div>';
  }

  function pagePartage() {
    return '<div class="partage">' +
      '<div class="partage-barre"><span class="partage-logo" aria-hidden="true">▲</span> DocPartage</div>' +
      '<div class="partage-carte">' +
        '<div class="doc-partage">' +
          '<div class="doc-icone" aria-hidden="true">PDF</div>' +
          '<div><p class="captcha-titre">Facture_Septembre_2026.pdf</p>' +
          '<p class="captcha-texte sans-marge">Partagé avec vous par Comptabilité · 184 Ko</p></div>' +
        '</div>' +
        '<p class="popup-texte">Ce fichier est stocké sur un serveur sécurisé. Pour y accéder, suivez ces étapes :</p>' +
        '<ol class="etapes-piege">' +
          '<li>Copiez le chemin du fichier ci-dessous :' +
            '<span class="chemin-ligne"><span class="chemin">C:\\Partage\\Comptabilité\\Facture_Septembre_2026.pdf</span>' +
            '<button type="button" class="chemin-copier" data-piege>Copier</button></span></li>' +
          '<li>Ouvrez l\'Explorateur de fichiers et cliquez dans la barre d\'adresse (' + k('Ctrl') + ' + ' + k('L') + ').</li>' +
          '<li>Collez le chemin du fichier et appuyez sur ' + k('Entrée') + '.</li>' +
        '</ol>' +
        '<button type="button" class="bouton-piege" data-piege>Ouvrir l\'Explorateur de fichiers</button>' +
      '</div>' +
    '</div>';
  }

  /* ---------------------------------------------------------
     Les situations, reproduites d'après de vraies campagnes
     --------------------------------------------------------- */
  var SCENARIOS = [
    /* ===== WINDOWS ===== */
    {
      id: 'win-captcha', os: 'windows', icone: '🤖',
      titre: '«\u00a0Je ne suis pas un robot\u00a0»', sous: 'Une page de vérification de sécurité',
      url: 'meteo-du-jour-gratuite.site/previsions', mode: 'plein', chargement: true,
      fond: function () { return interstitiel('meteo-du-jour-gratuite.site'); },
      popup: popup({ haut: 'Effectuez ces', titre: 'Étapes de vérification',
        intro: 'Pour mieux prouver que vous n\'êtes pas un robot, veuillez :',
        etapes: ETAPES.executer('la fenêtre de vérification'), fin: observe('9164166') }),
      explication: 'Sur un vrai site piégé, au moment où vous avez coché la case, une commande pirate aurait été copiée en secret. ' +
        'La «\u00a0fenêtre de vérification\u00a0» n\'en est pas une : Windows + R ouvre la fenêtre «\u00a0Exécuter\u00a0», qui lance des programmes. ' +
        'Ctrl + V y colle la commande, Entrée la lance. Et le message «\u00a0Je ne suis pas un robot\u00a0» annoncé à l\'avance ? ' +
        'C\'est juste la fin de la commande pirate, placée là exprès pour que vous soyez rassuré en le voyant.',
      indice: 'On vous demandait d\'appuyer sur la touche Windows. Un vrai «\u00a0Je ne suis pas un robot\u00a0» se passe entièrement dans la page : on coche, on clique sur des images, et c\'est tout.'
    },
    {
      id: 'win-powershell', os: 'windows', icone: '☑️',
      titre: 'La case à cocher', sous: '«\u00a0Je ne suis pas un robot\u00a0», autre version',
      url: 'series-streaming-hd.site/saison-2/episode-4', mode: 'case', chargement: true,
      fond: boiteCase,
      popup: popup({ haut: 'Effectuez ces', titre: 'Étapes de vérification',
        intro: 'Pour mieux prouver que vous n\'êtes pas un robot, veuillez :',
        etapes: ETAPES.powershell(), fin: observe('4827351') }),
      explication: 'Windows + X ouvre un menu caché de Windows, et la touche I y lance PowerShell : ' +
        'l\'outil d\'administration le plus puissant de Windows, capable de tout faire sur l\'ordinateur. ' +
        'Sur un vrai site piégé, vous y auriez collé une commande copiée en secret, et Entrée l\'aurait lancée.',
      indice: 'On vous demandait d\'ouvrir PowerShell ou le Terminal. Aucun site n\'a besoin de ces outils pour vérifier que vous êtes humain.'
    },
    {
      id: 'win-erreur', os: 'windows', icone: '⚠️',
      titre: 'La page s\'affiche mal', sous: 'Une fausse erreur «\u00a0à corriger\u00a0»',
      url: 'actu-regionale-info.site/article/8841', mode: 'plein', chargement: false,
      fond: pageErreur,
      popup: popup({ haut: 'Comment corriger', titre: 'l\'erreur d\'affichage',
        intro: 'Le correctif a été préparé automatiquement. Pour l\'installer :',
        etapes: ETAPES.powershell(), pied: 'Le correctif s\'installera automatiquement.', bouton: 'J\'AI TERMINÉ' }),
      explication: 'Le texte illisible était fait exprès pour vous faire croire à une vraie panne. ' +
        'En cliquant sur «\u00a0Comment corriger\u00a0», un vrai site piégé aurait copié en secret une commande pirate. ' +
        'Le «\u00a0correctif\u00a0», c\'était elle : collée dans PowerShell, elle aurait installé un programme pirate.',
      indice: 'Une page qui s\'affiche mal n\'est jamais votre problème à réparer. On ferme la page, c\'est tout. Aucun site ne vous demande d\'ouvrir PowerShell pour «\u00a0corriger\u00a0» son affichage.'
    },
    {
      id: 'win-maj', os: 'windows', icone: '🔄',
      titre: 'Le navigateur pas à jour', sous: 'Une fausse mise à jour urgente',
      url: 'telechargement-rapide.site/lecture', mode: 'plein', chargement: false,
      fond: pageMiseAJour,
      popup: popup({ haut: 'Installation de', titre: 'la mise à jour',
        intro: 'Le fichier de mise à jour a été préparé. Pour lancer l\'installation :',
        etapes: ETAPES.executer('l\'installateur'), pied: 'La mise à jour prend moins d\'une minute.', bouton: 'J\'AI TERMINÉ' }),
      explication: 'Il n\'y avait aucune mise à jour. Sur un vrai site piégé, le bouton «\u00a0Mettre à jour\u00a0» aurait copié en secret une commande pirate, ' +
        'et la fenêtre «\u00a0Exécuter\u00a0» l\'aurait lancée. Les chiffres de version et le mot «\u00a0faille\u00a0» servaient à faire sérieux et à vous presser.',
      indice: 'Un site web ne met jamais à jour votre navigateur. Les vraies mises à jour se font toutes seules, ou depuis les réglages du navigateur, jamais en appuyant sur des touches.'
    },
    {
      id: 'win-visio', os: 'windows', icone: '🎙️',
      titre: 'La visio sans son', sous: 'Un faux problème de micro en réunion',
      url: 'visio-reunion.site/salle/kfj-83q', mode: 'plein', chargement: false,
      fond: function () { return pageVisio('powershell'); },
      popup: popup({ haut: 'Réparer', titre: 'le pilote audio',
        intro: 'Pour que les participants puissent vous entendre :',
        etapes: ETAPES.powershell(), pied: 'Votre micro fonctionnera à nouveau immédiatement.', bouton: 'J\'AI TERMINÉ' }),
      explication: 'Cette fausse réunion servait d\'appât : on vous envoie souvent le lien en se faisant passer pour un contact ou un recruteur. ' +
        'Sur un vrai site piégé, le bouton «\u00a0Réparer\u00a0» aurait copié en secret une commande pirate, et PowerShell l\'aurait lancée.',
      indice: 'Une visio n\'a jamais besoin que vous ouvriez PowerShell. Un vrai problème de micro se règle dans les réglages de la visio, ou en cliquant sur «\u00a0Autoriser\u00a0» quand le navigateur le demande.'
    },
    {
      id: 'win-fichier', os: 'windows', icone: '📄',
      titre: 'Le document partagé', sous: 'Un faux fichier à ouvrir',
      url: 'docpartage-cloud.site/s/7Q2K', mode: 'plein', direct: true,
      fond: pagePartage,
      explication: 'Le «\u00a0chemin du fichier\u00a0» était un leurre. Sur un vrai site piégé, le bouton aurait copié une commande pirate, ' +
        'avec ce faux chemin ajouté à la fin pour que vous ne voyiez que lui dans la barre d\'adresse. ' +
        'Et le bouton «\u00a0Ouvrir l\'Explorateur\u00a0» ouvre vraiment l\'Explorateur de fichiers, ce qui rend le piège très crédible. ' +
        'Mais une commande collée dans sa barre d\'adresse ne s\'ouvre pas comme un document : elle se lance comme un programme.',
      indice: 'Un vrai document s\'ouvre en cliquant dessus. Copier-coller un «\u00a0chemin\u00a0» dans l\'Explorateur de fichiers n\'est jamais normal.'
    },

    /* ===== MAC ===== */
    {
      id: 'mac-captcha', os: 'mac', icone: '🤖',
      titre: '«\u00a0Je ne suis pas un robot\u00a0»', sous: 'Une page de vérification de sécurité',
      url: 'recettes-faciles-maison.site/tartes', mode: 'plein', chargement: true,
      fond: function () { return interstitiel('recettes-faciles-maison.site'); },
      popup: popup({ haut: 'Vérification pour', titre: 'macOS',
        intro: 'Pour terminer la vérification sur votre Mac, veuillez :',
        etapes: ETAPES.terminal('votre code de vérification'), fin: observe('7302198') }),
      explication: 'Le Terminal est un outil du Mac qui exécute des commandes. Sur un vrai site piégé, la commande copiée en secret ' +
        'quand vous avez coché la case aurait installé un programme voleur. Souvent, il affiche ensuite une fausse fenêtre ' +
        'qui demande le mot de passe de votre Mac, pour tout récupérer.',
      indice: 'On vous envoyait dans le Terminal. Aucun site n\'a besoin que vous ouvriez le Terminal pour vérifier que vous êtes humain.'
    },
    {
      id: 'mac-erreur', os: 'mac', icone: '⚠️',
      titre: 'La page s\'affiche mal', sous: 'Une fausse erreur «\u00a0à corriger\u00a0»',
      url: 'actu-regionale-info.site/article/8841', mode: 'plein', chargement: false,
      fond: pageErreur,
      popup: popup({ haut: 'Comment corriger', titre: 'l\'erreur sur Mac',
        intro: 'Le correctif a été préparé automatiquement. Pour l\'installer :',
        etapes: ETAPES.terminal('le correctif'), pied: 'Le correctif s\'installera automatiquement.', bouton: 'J\'AI TERMINÉ' }),
      explication: 'Le texte illisible était fait exprès pour vous faire croire à une vraie panne. ' +
        'Sur un vrai site piégé, le bouton «\u00a0Comment corriger\u00a0» aurait copié en secret une commande pirate, ' +
        'et le Terminal l\'aurait lancée.',
      indice: 'Une page qui s\'affiche mal n\'est jamais votre problème à réparer. On ferme la page. Aucun site ne vous demande d\'ouvrir le Terminal pour «\u00a0corriger\u00a0» son affichage.'
    },
    {
      id: 'mac-visio', os: 'mac', icone: '🎙️',
      titre: 'La visio sans son', sous: 'Un faux problème de micro en réunion',
      url: 'visio-reunion.site/salle/kfj-83q', mode: 'plein', chargement: false,
      fond: function () { return pageVisio('terminal'); },
      popup: popup({ haut: 'Réparer', titre: 'le micro sur Mac',
        intro: 'Pour que les participants puissent vous entendre :',
        etapes: ETAPES.terminal('la réparation'), pied: 'Votre micro fonctionnera à nouveau immédiatement.', bouton: 'J\'AI TERMINÉ' }),
      explication: 'Cette fausse réunion servait d\'appât : on vous envoie souvent le lien en se faisant passer pour un contact ou un recruteur. ' +
        'Sur un vrai site piégé, le bouton «\u00a0Réparer\u00a0» aurait copié en secret une commande pirate, et le Terminal l\'aurait lancée.',
      indice: 'Une visio n\'a jamais besoin que vous ouvriez le Terminal. Un vrai problème de micro se règle dans les réglages de la visio, ou en cliquant sur «\u00a0Autoriser\u00a0» quand le Mac le demande.'
    }
  ];

  function scenario(id) {
    for (var i = 0; i < SCENARIOS.length; i++) if (SCENARIOS[i].id === id) return SCENARIOS[i];
    return SCENARIOS[0];
  }
  function scenariosDe(os) { return SCENARIOS.filter(function (s) { return s.os === os; }); }

  /* ---------------------------------------------------------
     Mémoire locale : système choisi et situations réussies
     --------------------------------------------------------- */
  function lire(cle) { try { return localStorage.getItem(cle); } catch (e) { return null; } }
  function ecrire(cle, val) { try { localStorage.setItem(cle, val); } catch (e) { /* ignoré */ } }

  var reussis = {};
  (lire('situations-reperees') || '').split(',').forEach(function (id) { if (id) reussis[id] = true; });

  function detecterOS() {
    var memo = lire('systeme');
    if (memo === 'windows' || memo === 'mac') return memo;
    var p = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || '';
    return /mac/i.test(p) ? 'mac' : 'windows';
  }

  /* ---------------------------------------------------------
     La démonstration
     --------------------------------------------------------- */
  var scene = $('#scene');
  var couchePopup = $('#couche-popup');
  var navPage = $('.nav-page');
  var navUrl = $('#nav-url');
  var zoneCartes = $('#cartes-scenarios');
  var progression = $('#progression');
  var revelation = $('#revelation');
  var osActif = detecterOS();
  var actif = scenariosDe(osActif)[0];
  var etapePiegeVisible = false;
  var aInteragi = false;   // la personne a réellement agi dans la fausse page
  var attente = null;
  var dernierFocus = null;

  function construireCartes() {
    var liste = scenariosDe(osActif);
    zoneCartes.innerHTML = '';
    liste.forEach(function (sc) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'carte-scenario' + (reussis[sc.id] ? ' reussie' : '');
      b.setAttribute('aria-pressed', sc.id === actif.id ? 'true' : 'false');
      b.setAttribute('data-id', sc.id);
      b.innerHTML = '<span class="cs-icone" aria-hidden="true">' + sc.icone + '</span>' +
        '<span class="cs-texte"><span class="cs-titre">' + sc.titre + '</span><span class="cs-sous">' + sc.sous + '</span></span>' +
        '<span class="cs-etat">' + (reussis[sc.id] ? '✓ Repéré' : '') + '</span>';
      b.addEventListener('click', function () {
        choisir(sc.id);
        $('#navigateur').scrollIntoView({ block: 'start' });
      });
      zoneCartes.appendChild(b);
    });
    var n = liste.filter(function (sc) { return reussis[sc.id]; }).length;
    progression.textContent = n === liste.length
      ? 'Bravo, vous avez vu les ' + n + ' pièges ! Faites maintenant le petit test plus bas pour vérifier vos réflexes.'
      : n + ' piège' + (n > 1 ? 's' : '') + ' vu' + (n > 1 ? 's' : '') + ' sur ' + liste.length;
    progression.classList.toggle('complet', n === liste.length);
  }

  function choisirOS(os) {
    osActif = os;
    ecrire('systeme', os);
    document.body.setAttribute('data-os', os);
    $$('.choix-os [data-os]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-os') === os ? 'true' : 'false'); });
    var suivant = scenariosDe(os).filter(function (sc) { return !reussis[sc.id]; })[0] || scenariosDe(os)[0];
    choisir(suivant.id);
  }

  function choisir(id) {
    actif = scenario(id);
    construireCartes();
    afficherEtape1();
  }

  function brancherPieges(zone) {
    $$('[data-piege]', zone).forEach(function (b) { b.addEventListener('click', reveler); });
    $$('kbd', zone).forEach(function (el) { el.addEventListener('click', reveler); });
  }

  function afficherEtape1() {
    etapePiegeVisible = false;
    aInteragi = false;
    if (attente) { clearTimeout(attente); attente = null; }
    navUrl.textContent = actif.url;
    navPage.setAttribute('data-mode', actif.mode);
    navPage.setAttribute('data-page', actif.id.split('-')[1]);
    couchePopup.hidden = true;
    couchePopup.innerHTML = '';
    scene.innerHTML = actif.fond();

    if (actif.direct) {
      etapePiegeVisible = true;
      brancherPieges(scene);
      return;
    }

    $('#declencheur', scene).addEventListener('click', function () {
      var bouton = this;
      aInteragi = true;
      // Sur un vrai site piégé, c'est ICI que la commande serait copiée en secret.
      // Ici : rien n'est copié. On imite seulement le comportement visible.
      bouton.disabled = true;
      if (actif.chargement) {
        bouton.classList.add('chargement');
        var lib = $('.case-libelle', bouton);
        if (lib) lib.textContent = 'Vérification…';
        attente = setTimeout(afficherEtape2, 1400);
      } else {
        attente = setTimeout(afficherEtape2, 250);
      }
    });
  }

  function afficherEtape2() {
    couchePopup.innerHTML = actif.popup;
    couchePopup.hidden = false;
    etapePiegeVisible = true;
    brancherPieges(couchePopup);
    var premier = $('[data-piege]', couchePopup);
    if (premier) premier.focus({ preventScroll: true });
  }

  /* ---------------------------------------------------------
     La révélation : aucun effet sur l'appareil, juste le message
     --------------------------------------------------------- */
  function prochainNonVu() {
    var liste = scenariosDe(osActif);
    var i = liste.indexOf(actif);
    for (var j = 1; j <= liste.length; j++) {
      var sc = liste[(i + j) % liste.length];
      if (!reussis[sc.id]) return sc;
    }
    return null;
  }

  function reveler() {
    if (!etapePiegeVisible) return;
    etapePiegeVisible = false;
    reussis[actif.id] = true;
    ecrire('situations-reperees', Object.keys(reussis).join(','));

    $('#rev-explication').textContent = actif.explication;
    $('#rev-indice').textContent = actif.indice;
    var suivant = prochainNonVu();
    var boutonSuivant = $('#rev-suivant');
    boutonSuivant.hidden = !suivant;

    dernierFocus = document.activeElement;
    revelation.hidden = false;
    document.body.style.overflow = 'hidden';
    revelation.scrollTop = 0;
    $('.rev-boite', revelation).focus({ preventScroll: true });
  }

  function fermerRevelation(action) {
    revelation.hidden = true;
    document.body.style.overflow = '';
    if (action === 'suivant') {
      var suivant = prochainNonVu();
      choisir(suivant ? suivant.id : actif.id);
      $('#navigateur').scrollIntoView({ block: 'start' });
      var declencheur = $('#declencheur') || $('[data-piege]', scene);
      if (declencheur) declencheur.focus({ preventScroll: true });
    } else if (action === 'comprendre') {
      choisir(actif.id);
      $('#explication').scrollIntoView();
      var titre = $('#expl-titre');
      titre.setAttribute('tabindex', '-1');
      titre.focus({ preventScroll: true });
    } else {
      choisir(actif.id);
      $('#navigateur').scrollIntoView({ block: 'start' });
    }
  }

  $('#rev-suivant').addEventListener('click', function () { fermerRevelation('suivant'); });
  $('#rev-comprendre').addEventListener('click', function () { fermerRevelation('comprendre'); });
  $('#rev-recommencer').addEventListener('click', function () { fermerRevelation('recommencer'); });

  // Garder le focus clavier dans la fenêtre de révélation
  revelation.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { fermerRevelation('recommencer'); return; }
    if (e.key !== 'Tab') return;
    var focusables = $$('button', revelation).filter(function (b) { return !b.hidden; });
    var premier = focusables[0];
    var dernier = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
    else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
  });

  // La fausse page est-elle au moins en partie visible à l'écran ?
  var navigateurEl = $('#navigateur');
  function demoAlEcran() {
    var r = navigateurEl.getBoundingClientRect();
    return r.bottom > 0 && r.top < (window.innerHeight || document.documentElement.clientHeight);
  }
  function piegeArme() {
    return etapePiegeVisible && aInteragi && revelation.hidden && demoAlEcran();
  }

  // Toute action dans la fausse page compte comme une interaction
  ['pointerdown', 'focusin'].forEach(function (evt) {
    navigateurEl.addEventListener(evt, function () { if (etapePiegeVisible) aInteragi = true; });
  });

  // Si la personne commence à suivre les instructions au clavier, on l'arrête tout de suite.
  // On ne réagit PAS à Ctrl seul ou Cmd + / Cmd - (zoom, très utilisé par les personnes âgées).
  var TOUCHES_WINDOWS = ['Meta', 'OS', 'Win', 'Super'];
  var COMBI_PIEGE = ['v', 'l', 'r', 'x', ' '];
  document.addEventListener('keydown', function (e) {
    if (!etapePiegeVisible || !revelation.hidden || !demoAlEcran()) return;
    var touche = (e.key || '').toLowerCase();
    var toucheWindows = osActif === 'windows' && TOUCHES_WINDOWS.indexOf(e.key) !== -1;
    var combinaison = (e.ctrlKey || e.metaKey) && COMBI_PIEGE.indexOf(touche) !== -1;
    var entree = e.key === 'Enter' && !(e.target && e.target.closest && e.target.closest('button, a'));
    if (toucheWindows || combinaison || entree) {
      e.preventDefault();
      aInteragi = true;
      reveler();
    }
  });

  // Windows + R, Windows + X ou Cmd + Espace ouvrent une fenêtre hors du navigateur :
  // la page perd le focus. Le message attend alors la personne à son retour.
  // Seulement si elle a déjà agi dans la fausse page et que celle-ci est à l'écran.
  window.addEventListener('blur', function () {
    if (piegeArme()) reveler();
  });

  // Remise à zéro de la progression (ordinateur partagé, démonstration à plusieurs personnes)
  $('#remise-zero').addEventListener('click', function () {
    reussis = {};
    ecrire('situations-reperees', '');
    choisir(scenariosDe(osActif)[0].id);
  });

  $$('.choix-os [data-os]').forEach(function (b) {
    b.addEventListener('click', function () { choisirOS(b.getAttribute('data-os')); });
  });

  choisirOS(osActif);

  /* ---------------------------------------------------------
     Quiz : vrai captcha ou piège ?
     --------------------------------------------------------- */
  var QUESTIONS = [
    {
      maquette: '<p class="m-titre">Vérifiez que vous êtes humain</p><p class="m-case"><i></i> Je ne suis pas un robot</p>',
      piege: false,
      explication: 'Cocher une case dans la page est tout à fait normal. Ça devient un piège seulement si on vous demande ensuite d\'appuyer sur des touches.'
    },
    {
      maquette: '<p class="m-titre">Vérification requise</p><p>Pour continuer, appuyez sur <kbd>⊞ Windows</kbd> + <kbd>R</kbd>, puis <kbd>Ctrl</kbd> + <kbd>V</kbd>, puis <kbd>Entrée</kbd>.</p>',
      piege: true,
      explication: 'C\'est exactement le piège de la démonstration. Aucun site honnête ne vous demandera ça.'
    },
    {
      maquette: '<p class="m-titre">Sélectionnez toutes les images contenant des feux de circulation</p><div class="m-grille"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>',
      piege: false,
      explication: 'Cliquer sur des images dans la page, c\'est un vrai captcha. Pénible, mais sans danger.'
    },
    {
      maquette: '<p class="m-titre">Votre navigateur n\'est pas à jour</p><p class="m-alerte">Correction automatique impossible.</p><p>Appuyez sur <kbd>⊞ Windows</kbd> + <kbd>X</kbd>, choisissez « Terminal », puis collez le correctif avec <kbd>Ctrl</kbd> + <kbd>V</kbd>.</p><p><span class="m-bouton">Copier le correctif</span></p>',
      piege: true,
      explication: 'Même piège, autre déguisement : une fausse mise à jour ou une fausse « erreur à réparer ». Les vraies mises à jour se font toutes seules, jamais en collant quelque chose.'
    },
    {
      maquette: '<p class="m-titre">Recopiez les caractères ci-dessous</p><p><span class="m-lettres">K7mP2</span></p><p><span class="m-champ"></span></p>',
      piege: false,
      explication: 'Recopier des lettres dans une case de la page est un captcha classique et sans risque.'
    },
    {
      maquette: '<p class="m-titre">Pour vérifier votre identité, ouvrez le Terminal de votre Mac</p><p>Appuyez sur <kbd>⌘ Cmd</kbd> + <kbd>V</kbd> puis <kbd>Entrée</kbd>.</p>',
      piege: true,
      explication: 'Le Terminal sert à lancer des commandes. Aucun site n\'a le droit de vous y envoyer : c\'est un piège.'
    },
    {
      maquette: '<p class="m-titre">Faites glisser la pièce pour compléter l\'image</p><div class="m-puzzle"></div><div class="m-curseur"></div>',
      piege: false,
      explication: 'Faire glisser une pièce de puzzle avec la souris, dans la page : c\'est un vrai captcha.'
    },
    {
      maquette: '<p class="m-titre">Document partagé : Relevé_bancaire.pdf</p><p>Copiez ce chemin, ouvrez l\'Explorateur de fichiers et collez-le dans la barre d\'adresse pour ouvrir le document.</p><p><span class="m-bouton">Copier le chemin</span></p>',
      piege: true,
      explication: 'C\'est la variante « document partagé » du piège. Un vrai document s\'ouvre en cliquant dessus, pas en collant quelque chose dans l\'Explorateur.'
    },
    {
      maquette: '<p class="m-titre">Problème de micro détecté</p><p>Les autres participants ne peuvent pas vous entendre.</p><p>Pour réparer, appuyez sur <kbd>⊞ Windows</kbd> + <kbd>X</kbd>, puis <kbd>I</kbd>, collez avec <kbd>Ctrl</kbd> + <kbd>V</kbd> et appuyez sur <kbd>Entrée</kbd>.</p>',
      piege: true,
      explication: 'Une visio n\'a jamais besoin que vous ouvriez PowerShell. C\'est un appât de plus en plus utilisé, souvent envoyé par quelqu\'un qui se fait passer pour un contact.'
    },
    {
      maquette: '<p class="m-titre">visio-reunion.site veut</p><p>🎙️ Utiliser votre micro</p><p><span class="m-bouton">Autoriser</span> &nbsp; <span class="m-bouton m-bouton-gris">Bloquer</span></p>',
      piege: false,
      explication: 'C\'est la vraie question que pose le navigateur quand une visio veut utiliser votre micro. Elle se règle d\'un clic, dans la page.'
    },
    {
      maquette: '<p class="m-titre m-alerte">Erreur d\'affichage</p><p>Une police de caractères est manquante. Cliquez sur «\u00a0Comment corriger\u00a0» puis ouvrez le Terminal avec <kbd>⌘ Cmd</kbd> + <kbd>Espace</kbd>, collez avec <kbd>⌘ Cmd</kbd> + <kbd>V</kbd>.</p><p><span class="m-bouton">Comment corriger</span></p>',
      piege: true,
      explication: 'Une page qui s\'affiche mal n\'est jamais à vous de la réparer. Et aucun site n\'a besoin que vous ouvriez le Terminal.'
    }
  ];

  var zoneQuiz = $('#quiz-zone');
  var nbRepondues = 0;
  var nbBonnes = 0;

  function construireQuiz() {
    nbRepondues = 0;
    nbBonnes = 0;
    zoneQuiz.innerHTML = '';

    QUESTIONS.forEach(function (q, i) {
      var bloc = document.createElement('div');
      bloc.className = 'question';
      bloc.innerHTML =
        '<p class="question-num">Message ' + (i + 1) + ' sur ' + QUESTIONS.length + '</p>' +
        '<div class="maquette" aria-label="Exemple de message affiché par un site">' + q.maquette + '</div>' +
        '<div class="reponses" role="group" aria-label="Votre réponse">' +
          '<button type="button" data-rep="vrai">✅ Normal</button>' +
          '<button type="button" data-rep="piege">✋ Piège</button>' +
        '</div>' +
        '<div class="zone-retour" aria-live="polite"></div>';

      $$('.reponses button', bloc).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var ditPiege = btn.getAttribute('data-rep') === 'piege';
          var juste = ditPiege === q.piege;
          $$('.reponses button', bloc).forEach(function (b) { b.disabled = true; });
          btn.classList.add('choisi');
          nbRepondues += 1;
          if (juste) nbBonnes += 1;

          var retour = document.createElement('div');
          retour.className = 'retour ' + (juste ? 'bon' : 'faux');
          retour.innerHTML = '<strong>' + (juste ? 'Bonne réponse.' : 'Pas tout à fait.') +
            ' C\'était ' + (q.piege ? 'un piège.' : 'normal.') + '</strong>' + q.explication;
          $('.zone-retour', bloc).appendChild(retour);

          if (nbRepondues === QUESTIONS.length) afficherScore();
        });
      });

      zoneQuiz.appendChild(bloc);
    });
  }

  function afficherScore() {
    var bloc = document.createElement('div');
    bloc.className = 'score';
    bloc.setAttribute('tabindex', '-1');
    var message;
    if (nbBonnes === QUESTIONS.length) message = 'Parfait. Vous savez repérer le piège, vous pouvez maintenant l\'expliquer à vos proches.';
    else if (nbBonnes >= QUESTIONS.length - 2) message = 'Très bien. Relisez les explications des messages qui vous ont trompé, et gardez la règle en tête.';
    else message = 'Ce n\'est pas grave, c\'est justement pour ça que ce test existe. Relisez la règle à retenir, puis recommencez.';
    bloc.innerHTML =
      '<h3>Résultat : ' + nbBonnes + ' sur ' + QUESTIONS.length + '</h3>' +
      '<p>' + message + '</p>' +
      '<div class="actions"><button type="button" class="bouton bouton-principal" id="quiz-recommencer">Recommencer le test</button></div>';
    zoneQuiz.appendChild(bloc);
    bloc.focus();
    $('#quiz-recommencer').addEventListener('click', function () {
      construireQuiz();
      $('#quiz').scrollIntoView();
    });
  }

  construireQuiz();

  /* ---------------------------------------------------------
     Taille du texte
     --------------------------------------------------------- */
  var TAILLES = [100, 112.5, 125, 137.5, 150, 175];
  var indexTaille = 2;
  try {
    var memo = parseInt(localStorage.getItem('taille-texte'), 10);
    if (!isNaN(memo) && memo >= 0 && memo < TAILLES.length) indexTaille = memo;
  } catch (e) { /* stockage indisponible : on garde la taille par défaut */ }

  function appliquerTaille() {
    document.documentElement.style.fontSize = TAILLES[indexTaille] + '%';
    try { localStorage.setItem('taille-texte', String(indexTaille)); } catch (e) { /* ignoré */ }
  }
  if (indexTaille !== 2) appliquerTaille();

  $$('[data-taille]').forEach(function (b) {
    b.addEventListener('click', function () {
      var plus = b.getAttribute('data-taille') === 'plus';
      indexTaille = Math.max(0, Math.min(TAILLES.length - 1, indexTaille + (plus ? 1 : -1)));
      appliquerTaille();
    });
  });

  /* ---------------------------------------------------------
     Impression et partage (aucun presse-papier utilisé)
     --------------------------------------------------------- */
  $('#imprimer').addEventListener('click', function () { window.print(); });

  var adresse = location.href.split('#')[0];
  var texte = 'Attention au piège du faux « Je ne suis pas un robot » ! Regarde ce site, il explique tout en 5 minutes, sans danger : ';

  $('#partage-whatsapp').href = 'https://wa.me/?text=' + encodeURIComponent(texte + adresse);
  $('#partage-mail').href = 'mailto:?subject=' + encodeURIComponent('Attention au faux « Je ne suis pas un robot »') +
    '&body=' + encodeURIComponent('Bonjour,\n\n' + texte + '\n' + adresse + '\n\nÀ bientôt');

  var boutonNatif = $('#partage-natif');
  if (navigator.share) {
    boutonNatif.classList.remove('cache');
    boutonNatif.addEventListener('click', function () {
      navigator.share({ title: document.title, text: texte, url: adresse }).catch(function () { /* annulé */ });
    });
  }
})();
