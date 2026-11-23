export default function GreenSD() {
  return (
    <>
      <h2>Contexte</h2>
      <p>
        Projet de juin 2026 : concevoir une base de données MySQL pour gérer des livraisons et suivre les
        émissions de CO₂.
      </p>

      <ul className="pg-stat">
        <li>
          <span className="pg-stat-num">10</span>
          <span className="pg-stat-cap">tables MySQL</span>
        </li>
      </ul>

      <h2>Ce que j’ai fait</h2>
      <p>
        J’ai conçu le schéma relationnel : clés primaires, clés étrangères et une table d’association.
        Les 10 tables sont : partenaire, entrée, type de véhicule, véhicule, client, coefficient de
        CO₂ (clé composée type de véhicule et année), livreur, tournée, livraison et approvisionner.
        La base est en MySQL, avec le moteur InnoDB, qui applique l’intégrité référentielle.
      </p>
      <p>
        D’après mon CV, le projet comprenait aussi des imports de données en Python et une interface
        graphique complète en Tkinter. Ces parties ne sont pas détaillées ici.
      </p>

      <h2>Outils</h2>
      <p>
        MySQL, avec le moteur InnoDB. Python et Tkinter figurent sur mon CV pour ce projet, sans fichier
        à montrer ici.
      </p>
    </>
  )
}
