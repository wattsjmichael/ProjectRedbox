import type { WeaponType } from '../weapons/WeaponTypes'
import type {
  WeaponItem,
  WeaponModifiers,
  WeaponPrefix,
  WeaponSuffix,
} from './ItemTypes'

interface StatAdjustments {
  attackMultiplier?: number
  speedMultiplier?: number
  criticalChanceBonus?: number
  criticalDamageBonus?: number
}

interface AffixDefinition<TId extends string> {
  id: TId
  label: string
  description: string
  weapons: readonly WeaponType[]
  stats?: StatAdjustments
  modifiers?: WeaponModifiers
}

const ALL_WEAPONS: readonly WeaponType[] = [
  'rifle',
  'scattergun',
  'cannon',
  'photonLance',
  'greatsword',
]

export const WEAPON_PREFIXES:
  readonly AffixDefinition<WeaponPrefix>[] = [
    { id: 'heavy', label: 'Heavy', description: '+25% attack, -15% attack speed', weapons: ALL_WEAPONS, stats: { attackMultiplier: 1.25, speedMultiplier: 0.85 } },
    { id: 'rapid', label: 'Rapid', description: '+22% attack speed, -12% attack', weapons: ALL_WEAPONS, stats: { speedMultiplier: 1.22, attackMultiplier: 0.88 } },
    { id: 'brutal', label: 'Brutal', description: '+45% critical damage, -5% attack speed', weapons: ALL_WEAPONS, stats: { criticalDamageBonus: 0.45, speedMultiplier: 0.95 } },
    { id: 'deadeye', label: 'Deadeye', description: '+10% critical chance', weapons: ['rifle'], stats: { criticalChanceBonus: 0.1 } },
    { id: 'marksman', label: 'Marksman', description: 'Rounds pierce one additional target', weapons: ['rifle'], modifiers: { additionalPierce: 1 } },
    { id: 'longshot', label: 'Longshot', description: '+25% projectile range', weapons: ['rifle'], modifiers: { projectileRangeMultiplier: 1.25 } },
    { id: 'wideBore', label: 'Wide Bore', description: '+2 pellets', weapons: ['scattergun'], modifiers: { additionalPellets: 2 } },
    { id: 'crowdbreaker', label: 'Crowdbreaker', description: '+22% finisher spread', weapons: ['scattergun'], modifiers: { finisherSpreadMultiplier: 1.22 } },
    { id: 'reinforcedStock', label: 'Reinforced Stock', description: '35% less recoil', weapons: ['scattergun'], modifiers: { recoilMultiplier: 0.65 } },
    { id: 'siege', label: 'Siege', description: '+22% explosion radius', weapons: ['cannon'], modifiers: { explosionRadiusMultiplier: 1.22 } },
    { id: 'impact', label: 'Impact', description: '+25% finisher knockback', weapons: ['cannon'], modifiers: { knockbackMultiplier: 1.25 } },
    { id: 'overcharged', label: 'Overcharged', description: 'Photon Chain gains one link', weapons: ['photonLance'], modifiers: { additionalChains: 1 } },
    { id: 'focused', label: 'Focused', description: 'Photon rounds pierce one additional target', weapons: ['photonLance'], modifiers: { additionalPierce: 1 } },
    { id: 'conductive', label: 'Conductive', description: '+20% chain acquisition range', weapons: ['photonLance'], modifiers: { chainRangeMultiplier: 1.2 } },
    { id: 'executioner', label: 'Executioner', description: '+30% Greatsword sweet-spot window', weapons: ['greatsword'], modifiers: { sweetSpotMultiplier: 1.3 } },
  ]

export const WEAPON_SUFFIXES:
  readonly AffixDefinition<WeaponSuffix>[] = [
    { id: 'precision', label: 'of Precision', description: '+4% critical chance', weapons: ['rifle'], stats: { criticalChanceBonus: 0.04 } },
    { id: 'alignment', label: 'of Alignment', description: '+12% projectile range', weapons: ['rifle'], modifiers: { projectileRangeMultiplier: 1.12 } },
    { id: 'fury', label: 'of Fury', description: '+8% attack', weapons: ['scattergun'], stats: { attackMultiplier: 1.08 } },
    { id: 'breach', label: 'of Breach', description: '+1 pellet', weapons: ['scattergun'], modifiers: { additionalPellets: 1 } },
    { id: 'impact', label: 'of Impact', description: '+20% critical damage', weapons: ['cannon'], stats: { criticalDamageBonus: 0.2 } },
    { id: 'ruin', label: 'of Ruin', description: '+12% explosion radius', weapons: ['cannon'], modifiers: { explosionRadiusMultiplier: 1.12 } },
    { id: 'conductivity', label: 'of Conductivity', description: '+12% chain range', weapons: ['photonLance'], modifiers: { chainRangeMultiplier: 1.12 } },
    { id: 'resonance', label: 'of Resonance', description: 'Photon Chain gains one link', weapons: ['photonLance'], modifiers: { additionalChains: 1 } },
    { id: 'blood', label: 'of Blood', description: '+12% attack', weapons: ['greatsword'], stats: { attackMultiplier: 1.12 } },
    { id: 'mastery', label: 'of Mastery', description: '+15% sweet-spot window', weapons: ['greatsword'], modifiers: { sweetSpotMultiplier: 1.15 } },
  ]

const mergeModifiers = (
  target: WeaponModifiers,
  additions: WeaponModifiers
) => {
  for (const [key, value] of Object.entries(additions)) {
    const modifierKey = key as keyof WeaponModifiers
    const current = target[modifierKey]
    target[modifierKey] = (
      modifierKey.endsWith('Multiplier')
        ? (current ?? 1) * value
        : (current ?? 0) + value
    ) as never
  }
}

const applyDefinition = (
  item: WeaponItem,
  definition: AffixDefinition<string>
) => {
  const stats = definition.stats
  if (stats?.attackMultiplier) item.attack = Math.max(1, Math.round(item.attack * stats.attackMultiplier))
  if (stats?.speedMultiplier) item.speed = Number(Math.max(0.35, item.speed * stats.speedMultiplier).toFixed(2))
  if (stats?.criticalChanceBonus) item.criticalChance = Number(Math.min(0.7, item.criticalChance + stats.criticalChanceBonus).toFixed(3))
  if (stats?.criticalDamageBonus) item.criticalDamage = Number((item.criticalDamage + stats.criticalDamageBonus).toFixed(2))
  if (definition.modifiers) {
    item.modifiers ??= {}
    mergeModifiers(item.modifiers, definition.modifiers)
  }
}

const randomDefinition = <TId extends string>(
  definitions: readonly AffixDefinition<TId>[],
  weaponType: WeaponType
) => {
  const eligible = definitions.filter(definition => definition.weapons.includes(weaponType))
  return eligible[Math.floor(Math.random() * eligible.length)]
}

export const applyGeneratedAffixes = (
  item: WeaponItem,
  includeSuffix: boolean
) => {
  const prefix = randomDefinition(WEAPON_PREFIXES, item.weaponType)
  item.prefix = prefix.id
  item.affix = prefix.id
  applyDefinition(item, prefix)

  let suffixLabel = ''
  if (includeSuffix) {
    const suffix = randomDefinition(WEAPON_SUFFIXES, item.weaponType)
    item.suffix = suffix.id
    suffixLabel = ` ${suffix.label}`
    applyDefinition(item, suffix)
  }

  item.name = `${prefix.label} ${getWeaponDisplayName(item.weaponType)}${suffixLabel}`
}

export const getWeaponAffixDescriptions = (
  item: WeaponItem
) => {
  const descriptions: string[] = []
  const prefixId = item.prefix ?? item.affix
  const prefix = WEAPON_PREFIXES.find(definition => definition.id === prefixId)
  const suffix = WEAPON_SUFFIXES.find(definition => definition.id === item.suffix)
  if (prefix) descriptions.push(`${prefix.label.toUpperCase()} // ${prefix.description}`)
  if (suffix) descriptions.push(`${suffix.label.toUpperCase()} // ${suffix.description}`)
  return descriptions
}

export const getWeaponDisplayName = (
  weaponType: WeaponType
) => ({
  rifle: 'Rifle',
  scattergun: 'Scattergun',
  cannon: 'Cannon',
  photonLance: 'Photon Lance',
  greatsword: 'Greatsword',
})[weaponType]
