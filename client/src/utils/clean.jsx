export function cleanAgentText(text) {
  return text
    .replace(/\*\*/g, "") // remove **
    .replace(/\*/g, "") // remove *
    .replace(/\n+/g, "\n") // clean extra new lines
    .trim();
}
