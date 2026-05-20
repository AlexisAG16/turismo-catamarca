import mongoose from "mongoose";

const actividadSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    duracionEstimada: {
      type: String,
      trim: true,
    },
    costoAproximado: {
      type: Number,
      min: 0,
    },
    atractivo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Atractivo",
      required: true,
    },
  },
  {
    collection: "actividades",
    timestamps: true,
  }
);

if (
  mongoose.models.Actividad &&
  !mongoose.models.Actividad.schema.path("descripcion")
) {
  mongoose.deleteModel("Actividad");
}

export default mongoose.models.Actividad ||
  mongoose.model("Actividad", actividadSchema);
