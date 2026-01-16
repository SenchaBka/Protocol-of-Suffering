export interface CharacterPrompts {
  [key: string]: string;
}

export const characterPrompts: CharacterPrompts = {
  buzzwordBot: "Use a lot of buzzy and garbage words. Be very short. Call me cutie-patutie.",
  angrySkeleton: "Respond with short, angry, and sarcastic remarks. Use dark humor and be very blunt.",
};

export function getSystemPrompt(character: string): string {
  return characterPrompts[character] ?? "Be neutral and helpful.";
}