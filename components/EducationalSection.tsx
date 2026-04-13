import ScrollReveal from "./ScrollReveal";

export default function EducationalSection() {
  return (
    <section className="educational" id="learn" aria-labelledby="learn-title">
      <ScrollReveal>
        <div className="educational__block">
          <h2
            className="educational__heading"
            id="learn-title"
            style={{ fontSize: "var(--text-3xl)", textAlign: "center", marginBottom: "var(--space-12)" }}
          >
            Understanding the numbers
          </h2>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <div className="educational__block">
          <h3 className="educational__heading">What counts?</h3>
          <p className="educational__text">
            The count includes every human-made object in Earth orbit that is
            large enough to be tracked by the U.S. Space Surveillance Network —
            roughly anything larger than 10 cm. This includes working
            satellites, retired satellites, spent rocket stages, and fragments
            from collisions or deliberate destructions.
          </p>
          <p className="educational__text">
            Objects too small to track — estimated at over 100 million pieces
            below 1 cm — are not included in this count, but they still pose
            significant collision risks at orbital speeds.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <div className="educational__block">
          <h3 className="educational__heading">Why space debris matters</h3>
          <p className="educational__text">
            At orbital velocities, even a 1 cm paint flake carries the kinetic
            energy of a hand grenade. A collision between two large objects can
            create thousands of new fragments, each one a potential threat to
            other spacecraft.
          </p>
          <div className="educational__stat" aria-label="28,000 kilometers per hour">
            28,000 km/h
          </div>
          <p className="educational__text">
            That&apos;s how fast objects travel in low Earth orbit — roughly 7.8
            km per second. At that speed, relative collision velocities can
            exceed 14 km/s, making even tiny fragments lethal to spacecraft.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={300}>
        <div className="educational__block">
          <h3 className="educational__heading">How the count is measured</h3>
          <p className="educational__text">
            Orbital objects are tracked by the U.S. Space Force&apos;s 18th
            Space Defense Squadron (18 SDS) using a global network of ground-based
            radar and optical sensors, including the powerful Space Fence on
            Kwajalein Atoll.
          </p>
          <p className="educational__text">
            This data is made publicly available through{" "}
            <a
              href="https://www.space-track.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Space-Track.org
            </a>{" "}
            and{" "}
            <a
              href="https://celestrak.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              CelesTrak
            </a>
            , maintained by Dr. T.S. Kelso. Our data is sourced from
            CelesTrak&apos;s satellite catalog, which is updated several times
            daily.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={400}>
        <div className="educational__block">
          <h3 className="educational__heading">Limitations</h3>
          <p className="educational__text">
            This count represents publicly tracked, cataloged objects only. Some
            classified military satellites may not appear in the public catalog.
            Very small debris (under ~10 cm in LEO, or ~1 m in GEO) is
            generally too small to track and is not included. The true number of
            objects in orbit is significantly higher than what is shown here.
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
