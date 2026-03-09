/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {

  const sessions = app.findCollectionByNameOrId("sessions")

  sessions.fields.add(new NumberField({
    name: "lesson_index",
    min: 0,
  }))

  return app.save(sessions)

}, (app) => {

  const sessions = app.findCollectionByNameOrId("sessions")
  const field = sessions.fields.getByName("lesson_index")
  if (field) sessions.fields.remove(field)
  return app.save(sessions)

})
