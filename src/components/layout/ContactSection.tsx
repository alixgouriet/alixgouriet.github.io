import { contact } from '../../data/contact.ts'
import { CopyEmail } from '../ui/CopyEmail.tsx'

/** Section Encre : sert de page /contact et de pied de page sur les autres routes. */
export function ContactSection({ asPage = false }: { asPage?: boolean }) {
  const Title = asPage ? 'h1' : 'h2'
  // Hors de /contact, la section sert de pied de page : repère « contentinfo ».
  const Root = asPage ? 'section' : 'footer'
  return (
    <Root className={asPage ? 'ink on-ink contact is-page' : 'ink on-ink contact'} aria-labelledby="contact-title">
      <div className="wrap">
        <Title id="contact-title">Contact</Title>
        <p className="lead">
          Je cherche un stage de 10 semaines à partir d'avril 2027. Le plus simple est de m'écrire.
        </p>
        <dl className="contact-list">
          <div>
            <dt>E-mail</dt>
            <dd>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
              <div className="copy-row">
                <CopyEmail email={contact.email} />
              </div>
            </dd>
          </div>
          <div>
            <dt>Téléphone</dt>
            <dd>
              <a href={contact.phoneHref} className="tnum">
                {contact.phone}
              </a>
            </dd>
          </div>
          <div>
            <dt>Ville</dt>
            <dd>{contact.city}</dd>
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
        </dl>
        <p className="contact-foot">Alix Gouriet · BUT Science des Données, IUT de Niort</p>
      </div>
    </Root>
  )
}
