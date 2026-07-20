/* Piatti tipici dei principali paesi di destinazione Erasmus. Dati statici, nessuna dipendenza. */

const PAESI = [
  {
    id: "spagna",
    nome: "Spagna",
    bandiera: "🇪🇸",
    intro: "La cucina spagnola è fatta di condivisione: tapas, sobremesa lunghe e prodotti freschi. Ottima anche per un budget da studente, grazie ai menù del día.",
    piatti: [
      { nome: "Tortilla de patatas", emoji: "🍳", descrizione: "Frittata di patate e cipolla, si mangia calda o fredda: perfetta per un pranzo veloce ed economico." },
      { nome: "Paella", emoji: "🥘", descrizione: "Riso condito con verdure, pollo o frutti di mare, cotto in una padella larga e bassa. Piatto simbolo da provare almeno una volta." },
      { nome: "Jamón ibérico", emoji: "🍖", descrizione: "Prosciutto crudo stagionato, spesso servito a fette sottili come tapa con pane." },
      { nome: "Gazpacho", emoji: "🍅", descrizione: "Zuppa fredda di pomodoro, peperone e pane raffermo, tipica dell'estate andalusa." },
      { nome: "Churros con chocolate", emoji: "🍫", descrizione: "Bastoncini di pasta fritta da intingere in cioccolata calda densa: colazione o merenda molto amata." },
      { nome: "Croquetas", emoji: "🧆", descrizione: "Bocconcini fritti ripieni di besciamella con jamón, pollo o formaggio: tapa immancabile." },
      { nome: "Pan con tomate", emoji: "🍞", descrizione: "Pane tostato strofinato con pomodoro, aglio e olio: semplicissimo e onnipresente in Catalogna." },
      { nome: "Patatas bravas", emoji: "🌶️", descrizione: "Patate fritte servite con salsa piccante e maionese: classico da bar per l'aperitivo." }
    ]
  },
  {
    id: "francia",
    nome: "Francia",
    bandiera: "🇫🇷",
    intro: "In Francia il pasto è un rito: pane fresco ogni giorno, formaggi infiniti e una boulangerie ad ogni angolo.",
    piatti: [
      { nome: "Croissant", emoji: "🥐", descrizione: "Sfoglia burrosa da colazione, da comprare fresca ogni mattina in boulangerie." },
      { nome: "Baguette con formaggio", emoji: "🧀", descrizione: "Il pranzo più semplice ed economico: pane croccante e un pezzo di formaggio francese." },
      { nome: "Ratatouille", emoji: "🍆", descrizione: "Verdure estive stufate (melanzane, zucchine, peperoni, pomodori): piatto povero e gustoso." },
      { nome: "Crêpes", emoji: "🥞", descrizione: "Sottili frittelle dolci o salate (galettes), da provare nei chioschi di strada." },
      { nome: "Quiche Lorraine", emoji: "🥧", descrizione: "Torta salata con uova, panna e pancetta: ottima anche fredda il giorno dopo." },
      { nome: "Soupe à l'oignon", emoji: "🍲", descrizione: "Zuppa di cipolle gratinata con formaggio fuso, tipica dei mesi freddi." },
      { nome: "Bœuf bourguignon", emoji: "🍷", descrizione: "Spezzatino di manzo cotto lentamente nel vino rosso: piatto della domenica." },
      { nome: "Macarons", emoji: "🍬", descrizione: "Piccoli dolci colorati a base di meringa e mandorle: perfetti come souvenir commestibile." }
    ]
  },
  {
    id: "germania",
    nome: "Germania",
    bandiera: "🇩🇪",
    intro: "Cucina sostanziosa e conviviale, con street food economico ovunque nelle grandi città universitarie.",
    piatti: [
      { nome: "Currywurst", emoji: "🌭", descrizione: "Salsiccia a fette con salsa al curry e ketchup: lo street food tedesco per eccellenza." },
      { nome: "Brezel", emoji: "🥨", descrizione: "Pretzel salato tipico bavarese, perfetto come spuntino veloce tra una lezione e l'altra." },
      { nome: "Schnitzel", emoji: "🍗", descrizione: "Cotoletta impanata di maiale o vitello, servita con patate o insalata." },
      { nome: "Sauerkraut con salsicce", emoji: "🥬", descrizione: "Crauti fermentati accompagnati da salsicce: piatto tradizionale abbondante." },
      { nome: "Döner Kebab", emoji: "🥙", descrizione: "Adottato dalla comunità turca in Germania, è ormai il fast food più diffuso e amato dagli studenti." },
      { nome: "Kartoffelsalat", emoji: "🥔", descrizione: "Insalata di patate tiepida, spesso servita con maionese o aceto." },
      { nome: "Spätzle", emoji: "🍝", descrizione: "Piccoli gnocchetti di pasta all'uovo, spesso conditi con formaggio filante (Käsespätzle)." },
      { nome: "Apfelstrudel", emoji: "🍎", descrizione: "Strudel di mele in pasta sfoglia sottile, dolce classico da provare con la panna." }
    ]
  },
  {
    id: "portogallo",
    nome: "Portogallo",
    bandiera: "🇵🇹",
    intro: "Cucina di mare, pane e dolci alla crema: economica e ricca di sapori decisi, soprattutto a Lisbona e Porto.",
    piatti: [
      { nome: "Pastel de nata", emoji: "🥧", descrizione: "Tartelletta di crema pasticcera con superficie caramellata: il dolce simbolo del Portogallo." },
      { nome: "Bacalhau à Brás", emoji: "🐟", descrizione: "Baccalà sfilacciato con patate fritte a fiammifero e uova strapazzate." },
      { nome: "Francesinha", emoji: "🥪", descrizione: "Panino imbottito con vari tipi di carne, coperto di formaggio fuso e salsa piccante: specialità di Porto." },
      { nome: "Caldo verde", emoji: "🍲", descrizione: "Zuppa di patate e cavolo a listarelle sottili, spesso con una fetta di salsiccia (chouriço)." },
      { nome: "Bifana", emoji: "🥖", descrizione: "Panino con fettine di maiale marinate: street food veloce ed economico." },
      { nome: "Sardinhas assadas", emoji: "🐟", descrizione: "Sardine grigliate, protagoniste delle feste estive di giugno." },
      { nome: "Arroz de marisco", emoji: "🍚", descrizione: "Riso brodoso ai frutti di mare, piatto conviviale da condividere." },
      { nome: "Queijo da Serra", emoji: "🧀", descrizione: "Formaggio cremoso di pecora, ottimo spalmato sul pane." }
    ]
  },
  {
    id: "paesi-bassi",
    nome: "Paesi Bassi",
    bandiera: "🇳🇱",
    intro: "Snack veloci, frittura e tanto formaggio: la cucina olandese è pensata per essere mangiata camminando o in bici.",
    piatti: [
      { nome: "Stroopwafel", emoji: "🧇", descrizione: "Due cialde sottili con caramello al centro, buonissimo appoggiato su una tazza calda." },
      { nome: "Bitterballen", emoji: "🍡", descrizione: "Polpettine fritte ripiene di ragù cremoso, tipico snack da bar con la birra." },
      { nome: "Frites con maionese", emoji: "🍟", descrizione: "Patatine fritte spesse servite con maionese invece del ketchup." },
      { nome: "Haring", emoji: "🐟", descrizione: "Aringa cruda marinata, tradizionalmente mangiata a morsi tenendola per la coda." },
      { nome: "Kaas olandese", emoji: "🧀", descrizione: "Formaggi come il Gouda o l'Edam, protagonisti dei mercati settimanali." },
      { nome: "Poffertjes", emoji: "🥞", descrizione: "Mini frittelle soffici servite con zucchero a velo e burro." },
      { nome: "Erwtensoep", emoji: "🍲", descrizione: "Zuppa densa di piselli con wurstel affumicato, tipica dell'inverno." },
      { nome: "Broodje kroket", emoji: "🥖", descrizione: "Panino con crocchetta di carne croccante, classico pranzo veloce." }
    ]
  },
  {
    id: "belgio",
    nome: "Belgio",
    bandiera: "🇧🇪",
    intro: "Patatine, cioccolato e birra: il Belgio è un paradiso per chi ama lo street food di qualità.",
    piatti: [
      { nome: "Frites belghe", emoji: "🍟", descrizione: "Patatine fritte due volte, croccanti fuori e morbide dentro: le originali, da provare in una friterie." },
      { nome: "Gaufre", emoji: "🧇", descrizione: "Waffle di Liegi (caramellato) o di Bruxelles (soffice), da mangiare per strada." },
      { nome: "Cioccolato belga", emoji: "🍫", descrizione: "Praline artigianali vendute in ogni città: un must da provare e da regalare." },
      { nome: "Moules-frites", emoji: "🦪", descrizione: "Cozze cotte al vino bianco servite con patatine fritte: piatto nazionale." },
      { nome: "Birra trappista", emoji: "🍺", descrizione: "Birre prodotte in abbazia, da abbinare spesso a un formaggio o a un piatto di cozze." },
      { nome: "Speculoos", emoji: "🍪", descrizione: "Biscotti speziati alla cannella, ottimi con il caffè." },
      { nome: "Carbonnade flamande", emoji: "🍲", descrizione: "Spezzatino di manzo cotto nella birra scura, servito spesso con le frites." },
      { nome: "Croquette al formaggio", emoji: "🧀", descrizione: "Crocchette filanti a base di formaggio, tipico antipasto da bar." }
    ]
  },
  {
    id: "regno-unito",
    nome: "Regno Unito",
    bandiera: "🇬🇧",
    intro: "Tra pub, colazioni abbondanti e influenze da tutto il mondo, il cibo britannico è più vario di quanto sembri.",
    piatti: [
      { nome: "Fish and chips", emoji: "🐟", descrizione: "Filetto di pesce fritto in pastella con patatine: il classico da asporto della sera." },
      { nome: "English breakfast", emoji: "🍳", descrizione: "Uova, bacon, salsicce, fagioli, pomodoro e toast: colazione sostanziosa da provare almeno una volta." },
      { nome: "Sunday roast", emoji: "🍗", descrizione: "Arrosto della domenica con patate, verdure e Yorkshire pudding: tradizione da pub." },
      { nome: "Shepherd's pie", emoji: "🥧", descrizione: "Sformato di carne macinata coperto da purè di patate gratinato." },
      { nome: "Scones", emoji: "🍰", descrizione: "Panini dolci da tè, serviti con marmellata e clotted cream." },
      { nome: "Sandwich cheddar e pickle", emoji: "🥪", descrizione: "Panino veloce da pausa pranzo universitaria, economico e diffusissimo." },
      { nome: "Curry da British curry house", emoji: "🍛", descrizione: "Il curry è ormai un piatto nazionale d'adozione, molto amato dagli studenti la sera." },
      { nome: "Tè delle cinque", emoji: "🍵", descrizione: "Tè accompagnato da biscotti o piccoli dolci, momento sociale immancabile." }
    ]
  },
  {
    id: "polonia",
    nome: "Polonia",
    bandiera: "🇵🇱",
    intro: "Cucina casalinga, abbondante ed economica: perfetta per chi ha un budget Erasmus limitato.",
    piatti: [
      { nome: "Pierogi", emoji: "🥟", descrizione: "Ravioli ripieni di patate e formaggio, carne o frutta: si trovano ovunque e costano pochissimo." },
      { nome: "Bigos", emoji: "🍲", descrizione: "Stufato di crauti e carne cotto a lungo, ancora più buono riscaldato il giorno dopo." },
      { nome: "Żurek", emoji: "🍜", descrizione: "Zuppa acida a base di segale fermentata, spesso servita con uovo e salsiccia." },
      { nome: "Kiełbasa", emoji: "🌭", descrizione: "Salsiccia polacca grigliata, protagonista di ogni grigliata o mercatino." },
      { nome: "Placki ziemniaczane", emoji: "🥔", descrizione: "Frittelle di patate grattugiate, croccanti fuori e morbide dentro." },
      { nome: "Naleśniki", emoji: "🥞", descrizione: "Crêpes polacche farcite dolci o salate." },
      { nome: "Barszcz", emoji: "🍲", descrizione: "Zuppa di barbabietola dal colore rosso intenso, spesso servita con ravioli piccoli." },
      { nome: "Pączki", emoji: "🍩", descrizione: "Bomboloni ripieni di marmellata, tipici del giovedì grasso." }
    ]
  },
  {
    id: "repubblica-ceca",
    nome: "Repubblica Ceca",
    bandiera: "🇨🇿",
    intro: "Praga è famosa per la birra a buon prezzo, ma la cucina locale offre piatti caldi e sostanziosi.",
    piatti: [
      { nome: "Svíčková", emoji: "🍖", descrizione: "Manzo in salsa cremosa di verdure, servito con gnocchi di pane e panna acida." },
      { nome: "Trdelník", emoji: "🍩", descrizione: "Impasto arrotolato su uno spiedo, cotto e ricoperto di zucchero e cannella: dolce da strada iconico." },
      { nome: "Guláš con knedlíky", emoji: "🍲", descrizione: "Gulasch servito con gnocchi di pane per fare la scarpetta nel sugo." },
      { nome: "Smažený sýr", emoji: "🧀", descrizione: "Formaggio impanato e fritto, servito con patatine: comfort food da studenti." },
      { nome: "Birra ceca", emoji: "🍺", descrizione: "La Repubblica Ceca ha una delle birre più economiche e apprezzate d'Europa." },
      { nome: "Bramboráky", emoji: "🥔", descrizione: "Frittelle di patate speziate con maggiorana e aglio." },
      { nome: "Chlebíčky", emoji: "🥪", descrizione: "Tartine aperte guarnite con salumi, uova o insalate: perfette per un pranzo veloce." },
      { nome: "Palačinky", emoji: "🥞", descrizione: "Crêpes dolci farcite con marmellata, cioccolato o frutta." }
    ]
  },
  {
    id: "austria",
    nome: "Austria",
    bandiera: "🇦🇹",
    intro: "Tra caffetterie storiche e piatti da impero asburgico, Vienna è una tappa golosa per ogni Erasmus.",
    piatti: [
      { nome: "Wiener Schnitzel", emoji: "🍗", descrizione: "La cotoletta viennese per eccellenza, sottile e croccante, servita con limone." },
      { nome: "Sachertorte", emoji: "🍰", descrizione: "Torta al cioccolato con confettura di albicocche, dolce simbolo di Vienna." },
      { nome: "Kaiserschmarrn", emoji: "🥞", descrizione: "Frittata dolce sminuzzata, servita con zucchero a velo e composta di frutta." },
      { nome: "Käsekrainer", emoji: "🌭", descrizione: "Salsiccia ripiena di formaggio filante, tipico street food da chiosco (Würstelstand)." },
      { nome: "Apfelstrudel", emoji: "🍎", descrizione: "Versione austriaca dello strudel di mele, spesso servito ancora tiepido." },
      { nome: "Gulasch", emoji: "🍲", descrizione: "Spezzatino speziato di ispirazione ungherese, molto diffuso nei Beisl (trattorie tipiche)." },
      { nome: "Semmel con formaggio", emoji: "🥖", descrizione: "Panino tondo croccante, base di molti pranzi veloci da studente." },
      { nome: "Melange", emoji: "☕", descrizione: "Caffè viennese con schiuma di latte, da gustare con calma in un caffè storico." }
    ]
  },
  {
    id: "grecia",
    nome: "Grecia",
    bandiera: "🇬🇷",
    intro: "Cibo fresco, condiviso e mediterraneo: in Grecia mangiare bene con poco budget è facilissimo.",
    piatti: [
      { nome: "Souvlaki", emoji: "🍢", descrizione: "Spiedini di carne grigliata, spesso serviti dentro il pane pita: economico e ovunque." },
      { nome: "Gyros pita", emoji: "🥙", descrizione: "Carne cotta allo spiedo verticale avvolta in pita con patatine e salsa tzatziki." },
      { nome: "Moussaka", emoji: "🍆", descrizione: "Sformato a strati di melanzane, carne macinata e besciamella gratinata." },
      { nome: "Insalata greca (horiatiki)", emoji: "🥗", descrizione: "Pomodori, cetrioli, cipolla, olive e feta: il piatto estivo per eccellenza." },
      { nome: "Tzatziki con pane pita", emoji: "🥒", descrizione: "Salsa fresca di yogurt, cetriolo e aglio, perfetta come antipasto." },
      { nome: "Spanakopita", emoji: "🥧", descrizione: "Torta salata di spinaci e feta avvolta in pasta fillo croccante." },
      { nome: "Baklava", emoji: "🍯", descrizione: "Dolce a strati di pasta fillo, frutta secca e miele: molto dolce e ricco." },
      { nome: "Feta e olive", emoji: "🧀", descrizione: "Formaggio di pecora salato accompagnato da olive locali, presente in quasi ogni pasto." }
    ]
  },
  {
    id: "svezia",
    nome: "Svezia",
    bandiera: "🇸🇪",
    intro: "La tradizione del fika (pausa caffè con dolce) è il cuore della vita sociale svedese, anche tra studenti.",
    piatti: [
      { nome: "Köttbullar", emoji: "🍝", descrizione: "Polpette svedesi servite con purè di patate, salsa cremosa e marmellata di mirtilli rossi." },
      { nome: "Fika con kanelbulle", emoji: "🥐", descrizione: "Pausa caffè tradizionale con una brioche alla cannella: momento sociale irrinunciabile." },
      { nome: "Gravlax", emoji: "🐟", descrizione: "Salmone marinato in sale, zucchero e aneto, servito a fette sottili." },
      { nome: "Smörgåsbord", emoji: "🍽️", descrizione: "Buffet di piatti freddi e caldi tipico delle occasioni festive." },
      { nome: "Knäckebröd", emoji: "🍞", descrizione: "Pane croccante di segale, alimento base nelle case svedesi." },
      { nome: "Kanelbullar", emoji: "🍩", descrizione: "Girelle alla cannella, il dolce da fika più famoso." },
      { nome: "Falukorv", emoji: "🌭", descrizione: "Grande salsiccia affettata e cotta in padella, piatto economico e nostalgico." },
      { nome: "Räksmörgås", emoji: "🥪", descrizione: "Tartina aperta con gamberetti, uovo e maionese." }
    ]
  },
  {
    id: "danimarca",
    nome: "Danimarca",
    bandiera: "🇩🇰",
    intro: "Il concetto di hygge passa anche dalla tavola: piatti semplici, pane di segale e tanta convivialità.",
    piatti: [
      { nome: "Smørrebrød", emoji: "🥪", descrizione: "Tartina aperta su pane di segale, guarnita con salumi, pesce o formaggio: il pranzo tipico danese." },
      { nome: "Frikadeller", emoji: "🍖", descrizione: "Polpette di carne danesi, servite con patate bollite e salsa." },
      { nome: "Æbleflæsk", emoji: "🍏", descrizione: "Pancetta croccante servita con mele stufate, dolce e salato insieme." },
      { nome: "Wienerbrød", emoji: "🥐", descrizione: "La vera pasta danese sfogliata, base di molte colazioni danesi." },
      { nome: "Pølser", emoji: "🌭", descrizione: "Hot dog danese venduto ai chioschi di strada, spuntino veloce ed economico." },
      { nome: "Rugbrød", emoji: "🍞", descrizione: "Pane di segale scuro e denso, alla base della dieta danese quotidiana." },
      { nome: "Flæskesteg", emoji: "🐖", descrizione: "Arrosto di maiale con cotenna croccante, piatto delle feste." },
      { nome: "Risalamande", emoji: "🍚", descrizione: "Dolce natalizio a base di riso, panna e mandorle, servito con salsa di ciliegie." }
    ]
  },
  {
    id: "irlanda",
    nome: "Irlanda",
    bandiera: "🇮🇪",
    intro: "Piatti robusti e conviviali, spesso da gustare in un pub tra amici dopo lezione.",
    piatti: [
      { nome: "Irish stew", emoji: "🍲", descrizione: "Spezzatino di agnello o manzo con patate e carote, cucinato lentamente." },
      { nome: "Full Irish breakfast", emoji: "🍳", descrizione: "Colazione abbondante con uova, salsicce, bacon, fagioli e pudding: dà energia per tutta la giornata." },
      { nome: "Soda bread", emoji: "🍞", descrizione: "Pane veloce senza lievitazione lunga, spesso servito con il burro." },
      { nome: "Fish and chips irlandese", emoji: "🐟", descrizione: "Versione locale del classico britannico, molto diffusa nelle città costiere." },
      { nome: "Colcannon", emoji: "🥔", descrizione: "Purè di patate con cavolo o verza, piatto povero e confortante." },
      { nome: "Boxty", emoji: "🥞", descrizione: "Frittella di patate tipica del nord dell'isola." },
      { nome: "Guinness stew", emoji: "🍺", descrizione: "Spezzatino di manzo cotto nella birra scura Guinness." },
      { nome: "Barmbrack", emoji: "🍞", descrizione: "Pane dolce con uvetta, tradizionalmente legato ad Halloween." }
    ]
  },
  {
    id: "ungheria",
    nome: "Ungheria",
    bandiera: "🇭🇺",
    intro: "Budapest è nota per il cibo speziato e i prezzi ancora accessibili per uno studente Erasmus.",
    piatti: [
      { nome: "Gulyás", emoji: "🍲", descrizione: "Zuppa di manzo speziata con paprika, patate e verdure: il piatto nazionale ungherese." },
      { nome: "Lángos", emoji: "🫓", descrizione: "Pane fritto condito con panna acida e formaggio, street food iconico dei mercati." },
      { nome: "Paprikás csirke", emoji: "🍗", descrizione: "Pollo in salsa cremosa alla paprika, servito con gnocchetti (nokedli)." },
      { nome: "Töltött káposzta", emoji: "🥬", descrizione: "Involtini di cavolo ripieni di carne e riso, cotti in salsa di pomodoro." },
      { nome: "Dobos torta", emoji: "🍰", descrizione: "Torta a strati con crema al cioccolato e copertura di caramello croccante." },
      { nome: "Kürtőskalács", emoji: "🍩", descrizione: "Dolce a spirale cotto allo spiedo e ricoperto di zucchero, noto come 'dolce camino'." },
      { nome: "Halászlé", emoji: "🐟", descrizione: "Zuppa di pesce piccante a base di paprika, tipica lungo il Danubio." },
      { nome: "Palacsinta", emoji: "🥞", descrizione: "Crêpes ungheresi farcite dolci o salate." }
    ]
  }
];

function getPaeseById(id) {
  return PAESI.find(p => p.id === id);
}
