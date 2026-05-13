export default function SiteFooter() {
  return (
    <footer className="footer" aria-label="Site credits">
      <div className="footer__orbit-field" aria-hidden="true">
        <span className="footer__orbit footer__orbit--leo" />
        <span className="footer__orbit footer__orbit--meo" />
        <span className="footer__orbit footer__orbit--geo" />
        <span className="footer__object footer__object--one" />
        <span className="footer__object footer__object--two" />
        <span className="footer__object footer__object--three" />
        <span className="footer__object footer__object--four" />
      </div>

      <div className="footer__inner">
        <img
          className="footer__mark"
          src="/logo-mark.svg"
          alt=""
          width="96"
          height="96"
          aria-hidden="true"
        />

        <div className="footer__copy">
          <p>Data sourced from CelesTrak / 18th Space Defense Squadron</p>
          <p>Built with wonder. Not affiliated with any government agency.</p>
          <p>
            Made by{" "}
            <a
              href="https://www.instagram.com/yasir._jama/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link"
            >
              me
            </a>
          </p>
          <p>howmanyobjects.space © 2026</p>
        </div>
      </div>
    </footer>
  );
}
