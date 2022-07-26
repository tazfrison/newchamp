export enum SKILLS {
  NO = 0,
  MINOR = 1,
  FREE = 2,
  PAID = 3,
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
}

export enum TEAMS {
  Red = 'Red',
  Blue = 'Blue',
}

export const RED = TEAMS.Red;
export const BLU = TEAMS.Blue;

export const CLASS_NAMES: {[className in CLASSES]: string} = {
  scout: 'Scout',
  soldier: 'Soldier',
  pyro: 'Pyro',
  demoman: 'Demo',
  heavyweapons: 'Heavy',
  engineer: 'Engineer',
  medic: 'Medic',
  sniper: 'Sniper',
  spy: 'Spy',
}

export const TEAM_NAMES: {[team in TEAMS]: string} = {
  Red: 'RED',
  Blue: 'BLU',
}
