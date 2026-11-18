import { ErDiagram } from '../../charts/ErDiagram.tsx'

export default function GreenSD() {
  return (
    <>
      <h2>Contexte</h2>
      <p>
        Projet de juin 2026 : concevoir une base de données MySQL pour un schéma de logistique de
        livraison avec le suivi des émissions de CO₂.
      </p>

      <ul className="stat">
        <li>
          <span className="num">10</span>
          <span className="cap">tables MySQL</span>
        </li>
      </ul>

      <h2>Ce que j'ai fait</h2>
      <p>
        J'ai conçu le schéma relationnel : clés primaires, clés étrangères et une table d'association.
        Les 10 tables sont : partenaire, entrée, type de véhicule, véhicule, client, coefficient de
        CO₂ (clé composée type de véhicule et année), livreur, tournée, livraison et approvisionner.
        La base est en MySQL, avec le moteur InnoDB, qui applique l'intégrité référentielle.
      </p>
      <ErDiagram />
      <p>
        D'après mon CV, le projet comprenait aussi des imports de données en Python et une interface
        graphique complète en Tkinter. Ces parties ne sont pas détaillées ici.
      </p>

      <h2>Outils</h2>
      <p>MySQL, Python et Tkinter.</p>
    </>
  )
}
