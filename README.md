# README #

Procédure d'installation de L'API server node.js.

### Installation node.js ###

 (https://nodejs.org/en/)

### Installation de l'environement MongoDB ###

 (https://www.mongodb.org/)  
  
 *note* : Certaine fonctionnalité nécessitent une base de donnée remplie, Certaines méthodes de créations de DOC sont disponibles mais des outils comme Robomongo sont pratiques.


### Installer les dépendences via le Node Packages Manager ###

 Si le fichier "Package.json" est à jour un simple npm install suffit :

```
#!python

npm install
```
Sinon il faudra installer chacun des modules manquants séparements avec le suffixe **\-\-save** si vous voulez l'inclure par default dans package.json :

```
#!python

npm install nom_du_module --save
```


### Lancer la DB et le serveur ###

Lancer une console de commande depuis le répertoire */bin* dans le dossier d'installation puis lancer mongod:
```
#!python

mongod
```
Lancer une console de commande depuis la racine répertoire contenant le serveur puis ecrire:

```
#!python

node server.js
```

### Lien vers le wiki ###
[Accueil](https://bitbucket.org/sico2015/ppe/wiki/Home)
