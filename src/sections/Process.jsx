import { useScroll } from '../context/ScrollContext';
import { PROCESS } from '../data';
import SectionHeader from '../components/SectionHeader';
import Icon from '../lib/Icons';

export default function Process() {
  const { openBooking } = useScroll();

  return (
    <section className="process section" data-scroll-section>
      <div className="container">
        <SectionHeader
          eyebrow="How it works"
          segments={[{ t: 'From worry to plan, ' }, { t: 'in three steps.', em: true }]}
        />

        <ol className="process__grid">
          {PROCESS.map((p) => (
            <li className="process__item" key={p.step} data-reveal>
              <span className="process__num">{p.step}</span>
              <h3 className="process__title">{p.title}</h3>
              <p className="process__desc">{p.desc}</p>
            </li>
          ))}
        </ol>

        <p className="process__cta" data-reveal>
          Not sure which therapy your child needs?{' '}
          <button className="link-arrow" onClick={() => openBooking('Developmental Assessment')} data-cursor="hover">
            Start with a Developmental Assessment <Icon name="arrowR" size={15} strokeWidth={2.2} />
          </button>
        </p>
      </div>
    </section>
  );
}
