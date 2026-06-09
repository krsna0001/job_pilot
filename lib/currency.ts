export function getCurrencySymbol(locationStr?: string): string {
  if (!locationStr) return "$";
  
  const loc = locationStr.toLowerCase().trim();
  
  // Match Indian locations -> Rupee (₹)
  if (
    loc.includes("india") ||
    loc.includes("in") ||
    loc.includes("bangalore") ||
    loc.includes("bengaluru") ||
    loc.includes("delhi") ||
    loc.includes("mumbai") ||
    loc.includes("pune") ||
    loc.includes("hyderabad") ||
    loc.includes("chennai") ||
    loc.includes("gurgaon") ||
    loc.includes("noida")
  ) {
    return "₹";
  }
  
  // Match UK locations -> Pound (£)
  if (
    loc.includes("uk") ||
    loc.includes("london") ||
    loc.includes("gb") ||
    loc.includes("united kingdom") ||
    loc.includes("england") ||
    loc.includes("scotland") ||
    loc.includes("wales")
  ) {
    return "£";
  }
  
  // Match US locations or anything else -> Dollar ($)
  return "$";
}
