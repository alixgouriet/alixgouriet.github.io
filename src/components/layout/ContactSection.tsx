import { NavLink } from 'react-router'
import { contact } from '../../data/contact.ts'
import { CopyEmail } from '../ui/CopyEmail.tsx'
import { NAV } from './nav.ts'

/**
 * Pied de page (contentinfo) : navigation et, hors /contact, coordonnées.
 * `compact` : navigation seule (la page /contact porte déjà les coordonnées).
 */
export function SiteFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer className="ap-footer" aria-labelledby="pied-titre">
      <div className="ap-container ap-container--wide">
        <h2 id="pied-titre" className="sr-only">
          Navigation et contact
        </h2>
        <div className="ap-footer__cols">
          <div>
            <h3>Pages</h3>
            <ul>
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.end} viewTransition>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          {compact ? null : (
            <div>
              <h3>Me joindre</h3>
              <ul>
                <li>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </li>
                <li>
                  <a href={contact.phoneHref} className="tnum">
                    {contact.phone}
                  </a>
                </li>
                <li>
                  <a href={contact.cvHref}>Télécharger mon CV (PDF)</a>
                </li>
                {contact.linkedin ? (
                  <li>
                    <a href={contact.linkedin} rel="noopener noreferrer">
                      Mon profil LinkedIn
                    </a>
                  </li>
                ) : null}
                <li>
                  <span className="ap-footer__item">{contact.city}</span>
                </li>
              </ul>
            </div>
          )}
        </div>
        <p className="ap-footer__sign">Alix Gouriet · BUT Science des Données, IUT de Niort</p>
      </div>
    </footer>
  )
}

/** Page /contact (asPage) : section sombre centrée. Hors page, rend le pied de page. */
export function ContactSection({ asPage = false }: { asPage?: boolean }) {
  if (!asPage) return <SiteFooter />
  return (
    <section className="ap-contact ap-dark" aria-labelledby="contact-title">
      <div className="ap-container ap-contact__inner">
        <h1 id="contact-title" className="ap-title-xl ap-reveal">
          Contact
        </h1>
        <p className="ap-subtitle ap-contact__lead">
          Je cherche un stage de 10 semaines à partir d’avril 2027. Le plus simple est de m’écrire.
        </p>
        <a className="ap-contact__mail" href={`mailto:${contact.email}`}>
          {contact.email}
        </a>
        <div className="ap-contact__copy">
          <CopyEmail email={contact.email} />
        </div>
        <dl className="ap-contact__list">
          <div>
            <dt>Téléphone</dt>
            <dd>
              <a href={contact.phoneHref} className="tnum">
                {contact.phone}
              </a>
            </dd>
          </div>
          <div>
            <dt>CV</dt>
            <dd>
              <a href={contact.cvHref}>Télécharger mon CV (PDF)</a>
            </dd>
          </div>
          {contact.linkedin ? (
            <div>
              <dt>LinkedIn</dt>
              <dd>
                <a href={contact.linkedin} rel="noopener noreferrer">
                  Mon profil LinkedIn
                </a>
              </dd>
            </div>
          ) : null}
          <div>
            <dt>Ville</dt>
            <dd>{contact.city}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
