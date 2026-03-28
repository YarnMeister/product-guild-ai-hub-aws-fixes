export function getDifficultyLabel(d: 1 | 2 | 3): 'Beginner' | 'Intermediate' | 'Advanced' {
  return d === 1 ? 'Beginner' : d === 2 ? 'Intermediate' : 'Advanced';
}

