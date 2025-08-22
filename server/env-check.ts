export function checkEnvironment() {
  console.log("=== Environment Check ===");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);
  console.log("PORT:", process.env.PORT || "not set");
  console.log("========================");
  
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️  DATABASE_URL not found - using memory storage");
    return false;
  }
  
  return true;
}