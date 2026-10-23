// Notification cleanup is best-effort; ending the login session must still run.
export async function signOutWithCleanup(cleanup:()=>Promise<unknown>,endSession:()=>Promise<void>) {
  try { await cleanup(); } catch { /* A push error must not keep the user signed in. */ }
  await endSession();
}
