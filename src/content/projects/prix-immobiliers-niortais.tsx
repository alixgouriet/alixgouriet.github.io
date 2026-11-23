export default function PrixImmobiliersNiortais() {
  return (
    <>
      <h2>Contexte</h2>
      <p>
        SAÉ de régression sur des transactions immobilières (appartements et maisons) réalisées depuis
        2021 dans la Communauté d’Agglomération du Niortais. La question : prédire la valeur foncière
        d’un bien à partir de critères objectifs.
      </p>

      <ul className="pg-stat">
        <li>
          <span className="pg-stat-num">5 107</span>
          <span className="pg-stat-cap">transactions d’entraînement</span>
        </li>
        <li>
          <span className="pg-stat-num">148 000 €</span>
          <span className="pg-stat-cap">prix médian</span>
        </li>
        <li>
          <span className="pg-stat-num">1 277</span>
          <span className="pg-stat-cap">biens prédits</span>
        </li>
      </ul>

      <h2>Ce que j’ai fait</h2>
      <p>
        J’ai segmenté les données en 5 modèles : les maisons de Niort, les communes chères, moyennes
        et abordables, et les appartements. Les communes absentes des listes sont rattachées au modèle
        des communes moyennes.
      </p>
      <p>
        Chaque segment est modélisé par une régression linéaire simple, avec une transformation
        adaptée : racine carrée pour les maisons de Niort et les communes moyennes, log-log pour les
        appartements. Le coefficient de détermination R² mesure la qualité sur le jeu de test.
      </p>
      <p>
        La contrainte de l’énoncé était d’écrire la méthode en R natif, sans <code>lm()</code> ni{' '}
        <code>predict()</code> : la régression par moindres carrés est donc écrite à la main.
      </p>

      <h2>Résultats</h2>
      <p>
        R² de 0,15 à 0,52 selon les segments et les jeux de données. J’ai prédit la valeur de 1 277 biens et rendu
        le fichier de prédictions avec le code R.
      </p>

      <h2>Outils</h2>
      <p>R pour le code et la prédiction, Excel pour les tableaux et graphiques de résultats.</p>

      <p className="pg-note">
        Le nuage de points de cette page est illustratif : il n’utilise pas ces données.
      </p>
    </>
  )
}
