export enum SKILLS {
  NO = 0,
  MINOR = 1,
  FREE = 2,
  PAID = 3,
}

export const SKILL_TITLES = {
  [SKILLS.NO]: 'No Competitive Experience',
  [SKILLS.MINOR]: 'Minor Competitive Experience',
  [SKILLS.FREE]: 'Free League Experience',
  [SKILLS.PAID]: 'Paid League Experience',
}

export enum CLASSES {
  scout = 'scout',
  soldier = 'soldier',
  pyro = 'pyro',
  demoman = 'demoman',
  heavyweapons = 'heavyweapons',
  engineer = 'engineer',
  medic = 'medic',
  sniper = 'sniper',
  spy = 'spy',
  spectator = 'spectator',
  unassigned = 'unassigned',
}

export const CLASS_NAMES: {[className in CLASSES]: string} = {
  [CLASSES.scout]: 'Scout',
  [CLASSES.soldier]: 'Soldier',
  [CLASSES.pyro]: 'Pyro',
  [CLASSES.demoman]: 'Demo',
  [CLASSES.heavyweapons]: 'Heavy',
  [CLASSES.engineer]: 'Engineer',
  [CLASSES.medic]: 'Medic',
  [CLASSES.sniper]: 'Sniper',
  [CLASSES.spy]: 'Spy',
  [CLASSES.spectator]: 'Spectator',
  [CLASSES.unassigned]: 'Unassigned',
}

export const CLASS_ORDER: {[className in CLASSES]: number} = {
  [CLASSES.scout]: 1,
  [CLASSES.soldier]: 2,
  [CLASSES.pyro]: 3,
  [CLASSES.demoman]: 4,
  [CLASSES.heavyweapons]: 5,
  [CLASSES.engineer]: 6,
  [CLASSES.medic]: 7,
  [CLASSES.sniper]: 8,
  [CLASSES.spy]: 9,
  [CLASSES.spectator]: 10,
  [CLASSES.unassigned]: 11,
}

export enum TEAMS {
  Red = 'Red',
  Blue = 'Blue',
  Spectator = 'Spectator',
  Unassigned = 'Unassigned',
}

export const RED = TEAMS.Red;
export const BLU = TEAMS.Blue;

export const TEAM_NAMES: {[team in TEAMS]: string} = {
  Red: 'RED',
  Blue: 'BLU',
  Spectator: 'Spectator',
  Unassigned: 'Unassigned',
}
