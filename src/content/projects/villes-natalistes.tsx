export default function VillesNatalistes() {
  return (
    <>
      <h2>Contexte</h2>
      <p>
        SAÉ de production de données réalisée en octobre 2025, en binôme avec Nathan Michonneau. Face à
        la baisse de la natalité en France, nous cherchions quels profils démographiques ont les villes
        les plus natalistes.
      </p>

      <h2>Ce que nous avons fait</h2>
      <p>
        L'échantillon regroupe le dernier centile des communes selon leur taux de natalité moyen entre
        2016 et 2022 (18,6 ‰). Nous avons gardé une ville sur deux, parmi les communes de plus de 1 000
        habitants, puis comparé cet échantillon à la France entière.
      </p>
      <p>
        Les méthodes : échantillonnage par centile, taux de natalité, évolution de la population,
        pyramide des âges, comparaison des structures socioprofessionnelles et par sexe.
      </p>

      <h2>Résultats</h2>
      <ul className="stat">
        <li>
          <span className="num">+5 %</span>
          <span className="cap">population de l'échantillon, 2016 à 2022</span>
        </li>
        <li>
          <span className="num">+6 %</span>
          <span className="cap">population de la France, même période</span>
        </li>
      </ul>
      <p>
        Les écarts sont marqués d'une commune à l'autre. L'échantillon est plus jeune et plus actif que
        la France entière.
      </p>

      <h2>Outils</h2>
      <p>Excel, pour la sélection de l'échantillon, les indicateurs et les graphiques.</p>
    </>
  )
}
