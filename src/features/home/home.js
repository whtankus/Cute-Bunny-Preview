/* home feature functions; classic-script compatibility with current app state. */
'use strict';

function getKindness() {
  return kindLines[currentKindnessIndex % kindLines.length];
}

function rollKindness() {
  let next;
  do {
    next = Math.floor(Math.random() * kindLines.length);
  } while (kindLines.length > 1 && next === currentKindnessIndex);
  currentKindnessIndex = next;
  const p = $('#compliment');
  if (p) {
    p.textContent = getKindness();
    p.classList.remove('kindness-pop');
    void p.offsetWidth;
    p.classList.add('kindness-pop');
  }

  toast('A little drop of kindness for you ♡');
}
