/// <reference path="../pb_data/types.d.ts" />
// PocketBase v0.23+ does not add created/updated auto-timestamp columns
// automatically. This migration adds them explicitly to the collections
// that need chronological sorting on the Progress page.
migrate((app) => {
  for (const name of ["sessions", "module_progress"]) {
    const col = app.findCollectionByNameOrId(name)
    col.fields.add(new AutodateField({
      name:     "created",
      onCreate: true,
      onUpdate: false,
    }))
    col.fields.add(new AutodateField({
      name:     "updated",
      onCreate: true,
      onUpdate: true,
    }))
    app.save(col)
  }
}, (app) => {
  for (const name of ["sessions", "module_progress"]) {
    const col = app.findCollectionByNameOrId(name)
    for (const fieldName of ["created", "updated"]) {
      const f = col.fields.getByName(fieldName)
      if (f) col.fields.remove(f)
    }
    app.save(col)
  }
})
