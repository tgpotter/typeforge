/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {

  // ── profiles ──────────────────────────────────────────────────────────────
  // App-specific user data, separate from the auth users collection.
  const profiles = new Collection({
    name: "profiles",
    type: "base",
    listRule: "@request.auth.id = user.id",
    viewRule:  "@request.auth.id = user.id",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id = user.id",
    deleteRule: null,
    fields: [
      { name: "user",               type: "relation", required: true, collectionId: "_pb_users_auth_", maxSelect: 1, cascadeDelete: true },
      { name: "display_name",       type: "text" },
      { name: "current_module",     type: "text" },
      { name: "streak",             type: "number", min: 0 },
      { name: "last_practice_date", type: "date" },
      { name: "total_practice_min", type: "number", min: 0 },
    ],
  })

  app.save(profiles)

  // ── sessions ──────────────────────────────────────────────────────────────
  // One record per completed typing session.
  const sessions = new Collection({
    name: "sessions",
    type: "base",
    listRule: "@request.auth.id = user.id",
    viewRule:  "@request.auth.id = user.id",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id = user.id",
    deleteRule: null,
    fields: [
      { name: "user",         type: "relation", required: true, collectionId: "_pb_users_auth_", maxSelect: 1, cascadeDelete: false },
      { name: "module_id",    type: "text",     required: true },
      { name: "wpm",          type: "number",   required: true, min: 0 },
      { name: "accuracy",     type: "number",   required: true, min: 0, max: 100 },
      { name: "duration_sec", type: "number",   required: true, min: 0 },
      { name: "error_keys",   type: "json" },
    ],
  })

  app.save(sessions)

  // ── module_progress ───────────────────────────────────────────────────────
  // One record per user per module — tracks best scores and lesson completion.
  const moduleProgress = new Collection({
    name: "module_progress",
    type: "base",
    listRule: "@request.auth.id = user.id",
    viewRule:  "@request.auth.id = user.id",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id = user.id",
    deleteRule: null,
    fields: [
      { name: "user",              type: "relation", required: true, collectionId: "_pb_users_auth_", maxSelect: 1, cascadeDelete: true },
      { name: "module_id",         type: "text",     required: true },
      { name: "lessons_completed", type: "number",   min: 0 },
      { name: "best_wpm",          type: "number",   min: 0 },
      { name: "best_accuracy",     type: "number",   min: 0, max: 100 },
      { name: "last_practiced",    type: "date" },
    ],
  })

  app.save(moduleProgress)

}, (app) => {

  try { app.delete(app.findCollectionByNameOrId("module_progress")) } catch (_) {}
  try { app.delete(app.findCollectionByNameOrId("sessions")) } catch (_) {}
  try { app.delete(app.findCollectionByNameOrId("profiles")) } catch (_) {}

})
