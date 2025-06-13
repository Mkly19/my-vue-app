# test

> realisation d'une interface web d'analyse de l'occupation d'un batiment intelligent

## Notes

- Le projet fonctionne sous Linux, Node.js et npm doivent être installés.
- Les données d’occupation sont récupérées dynamiquement via l’API Spinalcom.
- En cas de souci, merci de vérifier la connectivité réseau.

## Structure du code

Le code source principal est organisé dans le dossier `src` :

- **components/** : Composants OccupationEtagesVue.js qui gèrent l’affichage de l’occupation, les statistiques et l’interface utilisateur.
- **api.js** : Fichier qui contient toutes les fonctions pour interagir avec l’API Spinalcom et récupérer les données dynamiques des pièces.
- **App.vue** : Composant racine qui structure la page principale et orchestre l’affichage de l’application.



## Clonage et installation

``` bash
#Ouvre un terminal et exécute :

git clone https://github.com/Mkly19/my-vue-app.git
cd my-vue-app

 ``` 

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
