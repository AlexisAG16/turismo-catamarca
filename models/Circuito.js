import mongoose from "mongoose";

const circuitoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    atractivos: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Atractivo",
        },
      ],
      validate: {
        validator: (atractivos) => Array.isArray(atractivos) && atractivos.length > 0,
        message: "El circuito debe tener al menos un atractivo asociado.",
      },
    },
  },
  {
    collection: "circuitos",
    timestamps: true,
  }
);

export default mongoose.models.Circuito ||
  mongoose.model("Circuito", circuitoSchema);
