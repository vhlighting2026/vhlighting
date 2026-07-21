const DIGITS = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

function readThreeDigits(value: number, full = false): string {
  const hundred = Math.floor(value / 100);
  const ten = Math.floor((value % 100) / 10);
  const unit = value % 10;
  const words: string[] = [];

  if (hundred > 0 || full) {
    words.push(DIGITS[hundred], "trăm");
  }
  if (ten > 1) {
    words.push(DIGITS[ten], "mươi");
    if (unit === 1) words.push("mốt");
    else if (unit === 4) words.push("tư");
    else if (unit === 5) words.push("lăm");
    else if (unit > 0) words.push(DIGITS[unit]);
  } else if (ten === 1) {
    words.push("mười");
    if (unit === 5) words.push("lăm");
    else if (unit > 0) words.push(DIGITS[unit]);
  } else if (unit > 0) {
    if (hundred > 0 || full) words.push("lẻ");
    words.push(DIGITS[unit]);
  }
  return words.join(" ");
}

export function moneyToVietnameseWords(input: number): string {
  const value = Math.max(0, Math.round(Number(input) || 0));
  if (value === 0) return "Không đồng";
  const scales = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
  const groups: number[] = [];
  let remaining = value;
  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }
  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    const full = i < groups.length - 1 && groups[i] < 100;
    parts.push(readThreeDigits(groups[i], full));
    if (scales[i]) parts.push(scales[i]);
  }
  const sentence = parts.join(" ").replace(/\s+/g, " ").trim();
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + " đồng";
}
