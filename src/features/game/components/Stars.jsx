import stars from '../../../assets/ui/stars.webp'

export default function Stars({ className = '' }) {
  // Callers position this; they must not pass a w-* class, which would beat this one.
  return <img src={stars} alt="" className={`w-[11.6rem] ${className}`} />
}
