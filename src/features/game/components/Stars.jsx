import stars from '../../../assets/ui/stars.webp'

export default function Stars({ className = '' }) {
  // Callers position this; they must not pass a plain w-* class, which would beat this one.
  // A `landscape:w-[…]` is fine (the landscape artboards size the stars per screen): a variant
  // class always lands after this base one.
  return <img src={stars} alt="" className={`w-[11.6rem] ${className}`} />
}
