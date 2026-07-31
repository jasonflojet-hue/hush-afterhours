// Shared between profile.js (editing) and members.js (browsing) so the tag
// list/icon set can't drift between the two. Originally lived inline in
// profile.js only; extracted here when members.js needed the same set.

export const ORIENTATION_TAGS = [
  { key: 'lgbtq', label: 'LGBTQ+ / Queer', sub: 'Open / all inclusive', color: '#ff2d95', glow: 'rgba(255,45,149,0.55)', icon: 'rainbow' },
  { key: 'pineapple', label: 'Pineapple', sub: 'Swinger / open to play', color: '#e8c34a', glow: 'rgba(232,195,74,0.55)', icon: 'pineapple' },
  { key: 'straight_man', label: 'Straight Man', sub: '', color: '#3aa0ff', glow: 'rgba(58,160,255,0.55)', icon: 'man' },
  { key: 'straight_woman', label: 'Straight Woman', sub: '', color: '#ff2d95', glow: 'rgba(255,45,149,0.55)', icon: 'woman' },
  { key: 'gay_man', label: 'Gay Man', sub: '', color: '#3aa0ff', glow: 'rgba(58,160,255,0.55)', icon: 'gay_man' },
  { key: 'gay_woman', label: 'Gay Woman', sub: '', color: '#ff2d95', glow: 'rgba(255,45,149,0.55)', icon: 'gay_woman' },
  { key: 'bi_male', label: 'Bi Male', sub: 'Two men + one woman', color: '#b45cff', glow: 'rgba(180,92,255,0.55)', icon: 'bi_male' },
  { key: 'bi_female', label: 'Bi Female', sub: 'Two women + one man', color: '#b45cff', glow: 'rgba(180,92,255,0.55)', icon: 'bi_female' },
  { key: 'polyamorous', label: 'Polyamorous', sub: 'Loving more than one', color: '#b45cff', glow: 'rgba(180,92,255,0.55)', icon: 'poly' },
  { key: 'pansexual', label: 'Pansexual', sub: 'Attracted to all genders', color: '#ff6bd6', glow: 'rgba(255,107,214,0.55)', icon: 'pan' },
  { key: 'transgender', label: 'Transgender', sub: 'Trans man / trans woman', color: '#7c6cff', glow: 'rgba(124,108,255,0.55)', icon: 'trans' },
  { key: 'ask_me', label: 'Buy me a drink and ask', sub: '', color: '#ff2d95', glow: 'rgba(255,45,149,0.55)', icon: 'drink' },
]

export function OrientationIcon({ id }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (id) {
    case 'man':
      return <svg viewBox="0 0 40 40" style={{ height: '100%' }}><g {...p}><circle cx="16" cy="25" r="9" /><line x1="22.5" y1="18.5" x2="31" y2="10" /><polyline points="23,10 31,10 31,18" /></g></svg>
    case 'woman':
      return <svg viewBox="0 0 40 40" style={{ height: '100%' }}><g {...p}><circle cx="20" cy="14" r="9" /><line x1="20" y1="23" x2="20" y2="34" /><line x1="14" y1="28" x2="26" y2="28" /></g></svg>
    case 'gay_man':
      return <svg viewBox="0 0 40 40" style={{ height: '100%' }}><g {...p}><circle cx="14" cy="26" r="8" /><circle cx="26" cy="26" r="8" /><line x1="9.5" y1="20.5" x2="4" y2="15" /><polyline points="4,20 4,15 9,15" /><line x1="30.5" y1="20.5" x2="36" y2="15" /><polyline points="31,15 36,15 36,20" /></g></svg>
    case 'gay_woman':
      return <svg viewBox="0 0 40 40" style={{ height: '100%' }}><g {...p}><circle cx="14" cy="15" r="8" /><circle cx="26" cy="15" r="8" /><line x1="14" y1="23" x2="14" y2="33" /><line x1="9" y1="28" x2="19" y2="28" /><line x1="26" y1="23" x2="26" y2="33" /><line x1="21" y1="28" x2="31" y2="28" /></g></svg>
    case 'bi_male':
      return <svg viewBox="0 0 56 40" style={{ height: '100%' }}><g {...p}><circle cx="12" cy="24" r="7" /><circle cx="24" cy="24" r="7" /><circle cx="38" cy="15" r="7" stroke="#ff2d95" /><line x1="17" y1="19" x2="12" y2="14" /><polyline points="12,19 12,14 17,14" /><line x1="29" y1="19" x2="34" y2="14" /><polyline points="29,14 34,14 34,19" /><line x1="38" y1="22" x2="38" y2="31" stroke="#ff2d95" /><line x1="34" y1="26" x2="42" y2="26" stroke="#ff2d95" /></g></svg>
    case 'bi_female':
      return <svg viewBox="0 0 56 40" style={{ height: '100%' }}><g {...p}><circle cx="12" cy="15" r="7" /><circle cx="24" cy="15" r="7" /><circle cx="38" cy="24" r="7" stroke="#3aa0ff" /><line x1="12" y1="22" x2="12" y2="31" /><line x1="8" y1="26" x2="16" y2="26" /><line x1="24" y1="22" x2="24" y2="31" /><line x1="20" y1="26" x2="28" y2="26" /><line x1="43" y1="19" x2="48" y2="14" stroke="#3aa0ff" /><polyline points="43,14 48,14 48,19" stroke="#3aa0ff" /></g></svg>
    case 'poly':
      return <svg viewBox="0 0 40 40" style={{ height: '100%' }}><g {...p}><path d="M20 15 C17 10 9 11 9 17 C9 24 20 30 20 30 C20 30 31 24 31 17 C31 11 23 10 20 15 Z" /><circle cx="12" cy="33" r="2.4" fill="currentColor" /><circle cx="20" cy="35" r="2.4" fill="currentColor" /><circle cx="28" cy="33" r="2.4" fill="currentColor" /></g></svg>
    case 'pan':
      return (
        <svg viewBox="0 0 40 40" style={{ height: '100%' }}>
          <defs><linearGradient id="panGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#ff2d95" /><stop offset="100%" stopColor="#3aa0ff" /></linearGradient></defs>
          <path d="M11 20 C11 14 19 14 20 20 C21 26 29 26 29 20 C29 14 21 14 20 20 C19 26 11 26 11 20 Z" fill="none" stroke="url(#panGrad)" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      )
    case 'trans':
      return (
        <svg viewBox="0 0 40 40" style={{ height: '100%' }}>
          <defs><linearGradient id="transGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3aa0ff" /><stop offset="50%" stopColor="#ff6bd6" /><stop offset="100%" stopColor="#7c6cff" /></linearGradient></defs>
          <g fill="none" stroke="url(#transGrad)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="20" cy="22" r="8" />
            <line x1="25.5" y1="16.5" x2="31" y2="11" /><polyline points="24,11 31,11 31,18" />
            <line x1="20" y1="30" x2="20" y2="36" /><line x1="16" y1="33" x2="24" y2="33" />
            <line x1="12.5" y1="16.5" x2="7" y2="11" /><line x1="7" y1="15" x2="7" y2="11" /><line x1="7" y1="11" x2="11" y2="11" />
          </g>
        </svg>
      )
    case 'drink':
      return <svg viewBox="0 0 40 40" style={{ height: '100%' }}><g {...p}><path d="M9 9 L20 22 L31 9 Z" /><line x1="20" y1="22" x2="20" y2="33" /><line x1="13" y1="33" x2="27" y2="33" /><circle cx="16" cy="12" r="2" fill="currentColor" /></g></svg>
    case 'pineapple':
      return (
        <svg viewBox="0 0 40 40" style={{ height: '100%' }}>
          <g fill="none" stroke="#5fae5f" strokeWidth="2.2" strokeLinecap="round">
            <path d="M20 13 L20 3 M16 10 L14 3 M24 10 L26 3 M13 12 L7 7 M27 12 L33 7" />
          </g>
          <ellipse cx="20" cy="25" rx="11" ry="13" fill="none" stroke="#e8c34a" strokeWidth="2.2" />
          <g stroke="#e8c34a" strokeWidth="1.4" opacity="0.8">
            <path d="M11 18 L29 32 M11 32 L29 18 M11 25 L29 25 M20 13 L20 37" fill="none" />
          </g>
        </svg>
      )
    case 'rainbow':
      return (
        <svg viewBox="0 0 40 40" style={{ height: '100%' }}>
          <g fill="none" strokeLinecap="round">
            <path d="M6 30 A14 14 0 0 1 34 30" stroke="#ff3b3b" strokeWidth="2.6" />
            <path d="M9 30 A11 11 0 0 1 31 30" stroke="#ff9f2d" strokeWidth="2.6" />
            <path d="M12 30 A8 8 0 0 1 28 30" stroke="#ffe22d" strokeWidth="2.6" />
            <path d="M15 30 A5 5 0 0 1 25 30" stroke="#3ad65c" strokeWidth="2.6" />
            <path d="M17.5 30 A2.5 2.5 0 0 1 22.5 30" stroke="#3aa0ff" strokeWidth="2.6" />
          </g>
          <line x1="20" y1="30" x2="20" y2="36" stroke="#f5f0e8" strokeWidth="1.6" />
        </svg>
      )
    default:
      return null
  }
}
