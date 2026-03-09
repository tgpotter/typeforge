/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const sessions = app.findCollectionByNameOrId("sessions")
  sessions.fields.add(new JSONField({ name: "key_timings" }))
  return app.save(sessions)
}, (app) => {
  const sessions = app.findCollectionByNameOrId("sessions")
  const field = sessions.fields.getByName("key_timings")
  if (field) sessions.fields.remove(field)
  return app.save(sessions)
})
