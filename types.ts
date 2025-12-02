export enum GameType {
  TANGRAM = 'TANGRAM',
  PATTERN = 'PATTERN',
  DRAWING = 'DRAWING',
  SYMBOL = 'SYMBOL',
  MEMORY = 'MEMORY',
  SHADOW = 'SHADOW',
  NONE = 'NONE'
}

export enum AppState {
  WELCOME = 'WELCOME',
  CHARACTER_SELECT = 'CHARACTER_SELECT',
  DASHBOARD = 'DASHBOARD',
  PLAYING = 'PLAYING',
  LIVE_CHAT = 'LIVE_CHAT'
}

export interface Character {
  id: string;
  name: string;
  emoji: string;
  color: string;
  voiceName: string; // 'Puck', 'Kore', 'Fenrir', 'Charon', 'Zephyr'
}

export const CHARACTERS: Character[] = [
  { id: '1', name: 'Zog', emoji: '👾', color: 'bg-vivid-purple', voiceName: 'Puck' },
  { id: '2', name: 'Dino', emoji: '🦖', color: 'bg-vivid-green', voiceName: 'Kore' },
  { id: '3', name: 'Star', emoji: '⭐', color: 'bg-vivid-yellow', voiceName: 'Fenrir' },
  { id: '4', name: 'Bunny', emoji: '🐰', color: 'bg-vivid-pink', voiceName: 'Charon' },
];

export interface LevelConfig {
  level: number;
  difficulty: 'easy' | 'medium' | 'hard';
}