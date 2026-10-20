/** Runs once when the server starts, in development and in production. */
export async function register() {
  // Not while building, and only where the file system is: the Node.js runtime.
  if (
    process.env.NEXT_RUNTIME !== "nodejs" ||
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    return;
  }

  const { addDemoOrders } = await import("@/backend/container");
  try {
    const added = await addDemoOrders();
    if (added > 0) {
      console.info(`${added} demo orders added to the empty store`);
    }
  } catch (error) {
    // The shop keeps running without them.
    console.error("Demo orders could not be added", error);
  }
}
