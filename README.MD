RFID projet 1

Ce projet vous permet de gérer le solde d'une carte RFID à l'aide d'un lecteur NFC et d'une interface en ligne de commande. Vous avez la possibilité d'effectuer des dépôts, des retraits, des achats ou une réinitialisation du solde.

Prérequis:
Node.js (version 12 ou supérieure)
npm (Gestionnaire de paquets Node)
Un lecteur NFC compatible

Installation:
Obtenez le code source en clonant le dépôt ou en téléchargeant les fichiers.
Dans le répertoire du projet, exécutez npm install pour installer les dépendances requises.

Utilisation:
Connectez votre lecteur NFC à votre ordinateur.
Lancez le script principal avec npm start.

Lorsqu'une carte est détectée, un menu s'affiche avec les options suivantes:
Déposer: Ajouter des fonds au solde de la carte.
Retirer: Soustraire des fonds du solde de la carte.
Acheter: Effectuer un achat (Sandwich, Salade, Jus) et déduire le montant correspondant du solde.

Reset: Réinitialiser le solde de la carte à zéro.
Suivez les instructions à l'écran pour réaliser l'opération souhaitée.
Remarque: Patientez 2 à 3 secondes après chaque opération pour permettre au lecteur NFC de traiter les données correctement.
